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
import { useAuth } from '../contexts/AuthContext';

export function useUserExpenses() {
    const { activeUser, app } = useAuth();
    const db = getFirestore(app);
    const storage = getStorage(app);

    const [expenses, setExpenses] = useState([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [totalPendingAmount, setTotalPendingAmount] = useState(0);

    // Fetch expenses
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

    // Calculate pending total
    useEffect(() => {
        const pendingTotal = expenses
            .filter(exp => exp.status === 'pending')
            .reduce((sum, expense) => sum + (expense.amount || 0), 0);
        setTotalPendingAmount(pendingTotal);
    }, [expenses]);

    // Delete storage file (helper)
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

    // Add expense
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

    // Delete expense
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
    }, [activeUser, db, storage, expenses, deleteStorageFile]); // Include deleteStorageFile in dependencies

    // Update expense
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
        updateExpense, // Expose the new function
        deleteStorageFile,
        totalPendingAmount
    };
}
