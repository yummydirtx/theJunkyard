// Copyright (c) 2025 Alex Frutkin
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (theJunkyard), to deal in
// theJunkyard without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// theJunkyard, and to permit persons to whom theJunkyard is furnished to do so,
// subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of theJunkyard.
// 
// THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

import { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Custom hook to manage user expenses.
 * It handles fetching, adding, deleting, and updating expenses for the authenticated user.
 * It also calculates the total amount of pending expenses.
 *
 * @returns {object} An object containing:
 *  - `expenses` {Array<object>}: The list of user's expenses.
 *  - `loadingExpenses` {boolean}: Loading state for fetching expenses.
 *  - `addExpense` {function}: Function to add a new expense.
 *  - `deleteExpense` {function}: Function to delete an expense.
 *  - `updateExpense` {function}: Function to update an existing expense.
 *  - `deleteStorageFile` {function}: Helper function to delete a file from Firebase Storage.
 *  - `totalPendingAmount` {number}: The total sum of amounts for expenses with 'pending' status.
 */
export function useUserExpenses() {
    const { activeUser, app } = useAuth();
    const db = getFirestore(app);
    const storage = getStorage(app);

    /** @state {Array<object>} expenses - List of expenses for the current user. */
    const [expenses, setExpenses] = useState([]);
    /** @state {boolean} loadingExpenses - True if expenses are currently being fetched. */
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    /** @state {number} totalPendingAmount - Sum of amounts for all pending expenses. */
    const [totalPendingAmount, setTotalPendingAmount] = useState(0);

    // Effect to fetch expenses when the active user or database instance changes.
    useEffect(() => {
        if (activeUser && db) {
            setLoadingExpenses(true);
            const expensesColRef = collection(db, "users", activeUser.uid, "expenses");
            const q = query(expensesColRef, orderBy("createdAt", "desc"));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedExpenses = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedExpenses.push({
                        ...data,
                        id: doc.id,
                        status: data.status || 'pending',
                        denialReason: data.denialReason || null,
                    });
                });
                setExpenses(fetchedExpenses);
                setLoadingExpenses(false);
            }, (error) => {
                console.error("Error fetching expenses: ", error);
                setLoadingExpenses(false);
            });

            return () => unsubscribe();
        } else {
            setExpenses([]);
            setLoadingExpenses(false);
        }
    }, [activeUser, db]);

    // Effect to recalculate the total pending amount whenever the expenses list changes.
    useEffect(() => {
        const pendingTotal = expenses
            .filter(exp => exp.status === 'pending')
            .reduce((sum, expense) => sum + (expense.amount || 0), 0);
        setTotalPendingAmount(pendingTotal);
    }, [expenses]);

    /**
     * Deletes a file from Firebase Storage given its GS URI.
     * @async
     * @param {string} gsUri - The GS URI of the file to delete (e.g., gs://bucket/path/to/file).
     * @returns {Promise<void>}
     */
    const deleteStorageFile = useCallback(async (gsUri) => {
        if (!gsUri || !storage) {
            console.log("No URI or storage, skipping deletion.");
            return;
        }
        console.log("Attempting to delete file from Storage:", gsUri);
        try {
            const storageRef = ref(storage, gsUri);
            await deleteObject(storageRef);
            console.log("File successfully deleted from Storage:", gsUri);
        } catch (error) {
            if (error.code === 'storage/object-not-found') {
                console.warn("Storage file not found (already deleted?):", gsUri);
            } else {
                console.error("Error deleting file from Storage:", gsUri, error);
                throw error; // Re-throw other errors
            }
        }
    }, [storage]);

    /**
     * Adds a new expense document to Firestore for the authenticated user.
     * @async
     * @param {object} newExpense - The expense object to add.
     * @param {string} newExpense.description - Description of the expense.
     * @param {number} newExpense.amount - Amount of the expense.
     * @param {string} [newExpense.receiptUri] - Optional GS URI of the uploaded receipt.
     * @param {Array<object>} [newExpense.items] - Optional list of itemized details for the expense.
     * @returns {Promise<void>}
     * @throws {Error} If user is not authenticated or if there's an error adding the document.
     */
    const addExpense = useCallback(async (newExpense) => {
        if (!activeUser || !db) {
            throw new Error("User not authenticated or database unavailable.");
        }
        const expenseData = {
            userId: activeUser.uid,
            description: newExpense.description,
            amount: newExpense.amount,
            receiptUri: newExpense.receiptUri || null,
            items: newExpense.items || null,
            status: 'pending',
            denialReason: null,
            createdAt: serverTimestamp(),
        };
        try {
            const docRef = await addDoc(collection(db, "users", activeUser.uid, "expenses"), expenseData);
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
            throw e;
        }
    }, [activeUser, db]);

    /**
     * Deletes an expense document from Firestore and its associated receipt from Storage (if any).
     * @async
     * @param {string} expenseId - The ID of the expense document to delete.
     * @returns {Promise<void>}
     */
    const deleteExpense = useCallback(async (expenseId) => {
        if (!activeUser || !db || !storage) {
            console.error("User not logged in or Firebase services not initialized.");
            return;
        }
        const expenseToDelete = expenses.find(exp => exp.id === expenseId);

        // Delete Receipt from Storage first
        if (expenseToDelete && expenseToDelete.receiptUri) {
            try {
                await deleteStorageFile(expenseToDelete.receiptUri);
            } catch (storageError) {
                console.error("Failed to delete storage file during expense deletion:", storageError);
                // Decide if you want to proceed with Firestore deletion even if storage fails
            }
        }

        // Delete Expense Document from Firestore
        try {
            const expenseDocRef = doc(db, "users", activeUser.uid, "expenses", expenseId);
            await deleteDoc(expenseDocRef);
            console.log("Expense document successfully deleted!");
        } catch (firestoreError) {
            console.error("Error deleting expense document: ", firestoreError);
            // Handle Firestore deletion error
        }
    }, [activeUser, db, storage, expenses, deleteStorageFile]);

    /**
     * Updates an existing expense document in Firestore.
     * @async
     * @param {string} expenseId - The ID of the expense document to update.
     * @param {object} updatedData - An object containing the fields to update.
     * @returns {Promise<void>}
     * @throws {Error} If user is not authenticated, database is unavailable, or input is invalid.
     */
    const updateExpense = useCallback(async (expenseId, updatedData) => {
        if (!activeUser || !db) {
            throw new Error("User not authenticated or database unavailable.");
        }
        if (!expenseId || !updatedData) {
            throw new Error("Expense ID and updated data must be provided.");
        }

        const expenseDocRef = doc(db, "users", activeUser.uid, "expenses", expenseId);
        const payload = {
            ...updatedData,
            updatedAt: serverTimestamp(), // Add timestamp for update
        };

        try {
            await updateDoc(expenseDocRef, payload);
            console.log("Expense document successfully updated:", expenseId);
        } catch (e) {
            console.error("Error updating document: ", expenseId, e);
            throw e; // Re-throw error for handling in the component
        }
    }, [activeUser, db]);

    return {
        expenses,
        loadingExpenses,
        addExpense,
        deleteExpense,
        updateExpense,
        deleteStorageFile,
        totalPendingAmount
    };
}
