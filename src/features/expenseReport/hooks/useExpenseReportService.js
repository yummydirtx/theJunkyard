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

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { useAuth } from '../../../contexts/AuthContext';
import ExpenseReportService from '../services/expenseReportService';
import { useFinancialEvents } from '../../../shared/hooks/useFinancialEvents';
import { financialEventBus } from '../../../shared/events/financialEventBus';

/**
 * Custom hook to manage user expenses using service abstraction.
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
function useExpenseReportService() {
    const { activeUser, app } = useAuth();
    const db = getFirestore(app);
    const storage = getStorage(app);

    // Create service instance
    const expenseService = useMemo(() => {
        return db ? new ExpenseReportService(db, storage) : null;
    }, [db, storage]);

    /** @state {Array<object>} expenses - List of expenses for the current user. */
    const [expenses, setExpenses] = useState([]);
    /** @state {boolean} loadingExpenses - True if expenses are currently being fetched. */
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    /** @state {number} totalPendingAmount - Sum of amounts for all pending expenses. */
    const [totalPendingAmount, setTotalPendingAmount] = useState(0);

    // Effect to subscribe to expenses when the active user or service changes.
    useEffect(() => {
        if (activeUser && expenseService) {
            setLoadingExpenses(true);

            const unsubscribe = expenseService.subscribeToUserExpenses(
                activeUser.uid,
                (fetchedExpenses) => {
                    setExpenses(fetchedExpenses);
                    setLoadingExpenses(false);
                },
                (error) => {
                    console.error("Error fetching expenses: ", error);
                    setLoadingExpenses(false);
                }
            );

            return () => unsubscribe();
        } else {
            setExpenses([]);
            setLoadingExpenses(false);
        }
    }, [activeUser, expenseService]);

    // Effect to recalculate the total pending amount whenever the expenses list changes.
    useEffect(() => {
        if (expenseService) {
            const pendingTotal = expenseService.calculateTotalPendingAmount(expenses);
            setTotalPendingAmount(pendingTotal);
        }
    }, [expenses, expenseService]);

    // Listen for budget-related events to potentially react to budget changes
    useEffect(() => {
        if (!activeUser) return;

        const handleBudgetEvent = (event) => {
            // When budget entries are added/updated/deleted, we might want to show notifications
            // or update related expense data if there are integrations
            if (event.payload?.userId === activeUser.uid) {
                console.log('Budget event received in expense hook:', event.type);
                // Optional: Add logic here for cross-feature reactions
                // For example, showing budget vs expense comparisons
            }
        };

        const unsubscribe = financialEventBus.subscribe('budget.*', handleBudgetEvent);
        return unsubscribe;
    }, [activeUser]);

    /**
     * Deletes a file from Firebase Storage given its GS URI.
     * @async
     * @param {string} gsUri - The GS URI of the file to delete (e.g., gs://bucket/path/to/file).
     * @returns {Promise<void>}
     */
    const deleteStorageFile = useCallback(async (gsUri) => {
        if (!expenseService) {
            console.log("Service not available, skipping deletion.");
            return;
        }
        await expenseService.deleteStorageFile(gsUri);
    }, [expenseService]);

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
        if (!activeUser || !expenseService) {
            throw new Error("User not authenticated or service unavailable.");
        }

        try {
            await expenseService.addExpense(activeUser.uid, {
                description: newExpense.description,
                amount: newExpense.amount,
                receiptUri: newExpense.receiptUri || null,
                items: newExpense.items || null,
            });
        } catch (e) {
            console.error("Error adding expense: ", e);
            throw e;
        }
    }, [activeUser, expenseService]);

    /**
     * Deletes an expense document from Firestore and its associated receipt from Storage (if any).
     * @async
     * @param {string} expenseId - The ID of the expense document to delete.
     * @returns {Promise<void>}
     */
    const deleteExpense = useCallback(async (expenseId) => {
        if (!activeUser || !expenseService) {
            console.error("User not logged in or service not available.");
            return;
        }

        const expenseToDelete = expenses.find(exp => exp.id === expenseId);
        
        if (!expenseToDelete) {
            console.error("Expense not found in local state.");
            return;
        }

        try {
            await expenseService.deleteExpenseWithReceipt(activeUser.uid, expenseId, expenseToDelete);
        } catch (error) {
            console.error("Error deleting expense: ", error);
            throw error;
        }
    }, [activeUser, expenseService, expenses]);

    /**
     * Updates an existing expense document in Firestore.
     * @async
     * @param {string} expenseId - The ID of the expense document to update.
     * @param {object} updatedData - An object containing the fields to update.
     * @returns {Promise<void>}
     * @throws {Error} If user is not authenticated, service is unavailable, or input is invalid.
     */
    const updateExpense = useCallback(async (expenseId, updatedData) => {
        if (!activeUser || !expenseService) {
            throw new Error("User not authenticated or service unavailable.");
        }
        if (!expenseId || !updatedData) {
            throw new Error("Expense ID and updated data must be provided.");
        }

        try {
            await expenseService.updateExpense(activeUser.uid, expenseId, updatedData);
            console.log("Expense document successfully updated:", expenseId);
        } catch (e) {
            console.error("Error updating expense: ", expenseId, e);
            throw e;
        }
    }, [activeUser, expenseService]);

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

// Export the hook as default
export default useExpenseReportService;
