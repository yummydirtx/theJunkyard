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
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    onSnapshot, 
    orderBy, 
    doc, 
    deleteDoc, 
    updateDoc,
    Firestore,
    DocumentData,
    QuerySnapshot,
    DocumentSnapshot
} from "firebase/firestore";
import { getStorage, ref, deleteObject, FirebaseStorage } from "firebase/storage";
import { useAuth } from '../../../contexts/AuthContext';
import { UseUserExpensesReturn, NewExpenseData, Expense } from '../types';

/**
 * Custom hook to manage user expenses.
 * It handles fetching, adding, deleting, and updating expenses for the authenticated user.
 * It also calculates the total amount of pending expenses.
 *
 * @returns {UseUserExpensesReturn} An object containing:
 *  - `expenses` {Array<Expense>}: The list of user's expenses.
 *  - `loadingExpenses` {boolean}: Loading state for fetching expenses.
 *  - `addExpense` {function}: Function to add a new expense.
 *  - `deleteExpense` {function}: Function to delete an expense.
 *  - `updateExpense` {function}: Function to update an existing expense.
 *  - `deleteStorageFile` {function}: Helper function to delete a file from Firebase Storage.
 *  - `totalPendingAmount` {number}: The total sum of amounts for expenses with 'pending' status.
 */
export function useUserExpenses(): UseUserExpensesReturn {
    const { activeUser, app } = useAuth();
    const db: Firestore = getFirestore(app);
    const storage: FirebaseStorage = getStorage(app);

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loadingExpenses, setLoadingExpenses] = useState<boolean>(false);
    const [totalPendingAmount, setTotalPendingAmount] = useState<number>(0);

    // Effect to fetch expenses when the active user or database instance changes.
    useEffect(() => {
        if (activeUser && db) {
            setLoadingExpenses(true);
            const expensesColRef = collection(db, "users", activeUser.uid, "expenses");
            const q = query(expensesColRef, orderBy("createdAt", "desc"));

            const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
                const fetchedExpenses: Expense[] = [];
                querySnapshot.forEach((doc: DocumentSnapshot<DocumentData>) => {
                    const data = doc.data();
                    if (data) {
                        fetchedExpenses.push({
                            ...data,
                            id: doc.id,
                            status: data.status || 'pending',
                            denialReason: data.denialReason || null,
                        } as Expense);
                    }
                });
                setExpenses(fetchedExpenses);
                setLoadingExpenses(false);
            }, (error: Error) => {
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
            .reduce((sum, expense) => sum + (expense.amount || expense.totalAmount || 0), 0);
        setTotalPendingAmount(pendingTotal);
    }, [expenses]);

    /**
     * Deletes a file from Firebase Storage given its GS URI.
     * @param {string} gsUri - The GS URI of the file to delete (e.g., gs://bucket/path/to/file).
     */
    const deleteStorageFile = useCallback(async (gsUri: string): Promise<void> => {
        if (!gsUri || !storage) {
            console.log("No URI or storage, skipping deletion.");
            return;
        }
        console.log("Attempting to delete file from Storage:", gsUri);
        try {
            const storageRef = ref(storage, gsUri);
            await deleteObject(storageRef);
            console.log("File successfully deleted from Storage:", gsUri);
        } catch (error: any) {
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
     * @param {NewExpenseData} newExpense - The expense object to add.
     * @throws {Error} If user is not authenticated or if there's an error adding the document.
     */
    const addExpense = useCallback(async (newExpense: NewExpenseData): Promise<void> => {
        if (!activeUser || !db) {
            throw new Error("User not authenticated or database unavailable.");
        }
        const expenseData = {
            userId: activeUser.uid,
            description: newExpense.description,
            totalAmount: newExpense.amount,
            receiptUri: newExpense.receiptUri || null,
            items: newExpense.items || null,
            status: 'pending' as const,
            denialReason: null,
            date: new Date().toISOString(),
            submittedAt: new Date(),
            updatedAt: new Date(),
            createdAt: serverTimestamp(),
        };
        try {
            const docRef = await addDoc(collection(db, "users", activeUser.uid, "expenses"), expenseData);
            console.log("Document written with ID: ", docRef.id);
        } catch (e: any) {
            console.error("Error adding document: ", e);
            throw e;
        }
    }, [activeUser, db]);

    /**
     * Deletes an expense document from Firestore and its associated receipt from Storage (if any).
     * @param {string} expenseId - The ID of the expense document to delete.
     */
    const deleteExpense = useCallback(async (expenseId: string): Promise<void> => {
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
     * @param {string} expenseId - The ID of the expense document to update.
     * @param {Partial<Expense>} updatedData - An object containing the fields to update.
     * @throws {Error} If user is not authenticated, database is unavailable, or input is invalid.
     */
    const updateExpense = useCallback(async (expenseId: string, updatedData: Partial<Expense>): Promise<void> => {
        if (!activeUser || !db) {
            throw new Error("User not authenticated or database unavailable.");
        }
        if (!expenseId || !updatedData) {
            throw new Error("Expense ID and updated data must be provided.");
        }

        const expenseDocRef = doc(db, "users", activeUser.uid, "expenses", expenseId);
        const payload = {
            ...updatedData,
            updatedAt: new Date(),
            updatedAtFirestore: serverTimestamp(), // Add timestamp for update
        };

        try {
            await updateDoc(expenseDocRef, payload);
            console.log("Expense document successfully updated:", expenseId);
        } catch (e: any) {
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
