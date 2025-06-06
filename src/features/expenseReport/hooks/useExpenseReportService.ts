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
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { useAuth } from '../../../contexts/AuthContext';
import ExpenseReportService from '../services/expenseReportService';
import { useFinancialEvents } from '../../../shared/hooks/useFinancialEvents';
import { financialEventBus } from '../../../shared/events/financialEventBus';
import { UseExpenseReportServiceReturn, Expense, NewExpenseData } from '../types';

/**
 * Custom hook to manage user expenses using service abstraction.
 * It handles fetching, adding, deleting, and updating expenses for the authenticated user.
 * It also calculates the total amount of pending expenses.
 *
 * @returns {UseExpenseReportServiceReturn} An object containing:
 *  - `expenses` {Array<Expense>}: The list of user's expenses.
 *  - `loadingExpenses` {boolean}: Loading state for fetching expenses.
 *  - `addExpense` {function}: Function to add a new expense.
 *  - `deleteExpense` {function}: Function to delete an expense.
 *  - `updateExpense` {function}: Function to update an existing expense.
 *  - `deleteStorageFile` {function}: Helper function to delete a file from Firebase Storage.
 *  - `totalPendingAmount` {number}: The total sum of amounts for expenses with 'pending' status.
 */
function useExpenseReportService(): UseExpenseReportServiceReturn {
    const { activeUser, app } = useAuth();
    const db: Firestore = getFirestore(app);
    const storage: FirebaseStorage = getStorage(app);

    // Create service instance
    const expenseService = useMemo(() => {
        return db ? new ExpenseReportService(db, storage) : null;
    }, [db, storage]);

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loadingExpenses, setLoadingExpenses] = useState<boolean>(false);
    const [totalPendingAmount, setTotalPendingAmount] = useState<number>(0);

    // Effect to subscribe to expenses when the active user or service changes.
    useEffect(() => {
        if (activeUser && expenseService) {
            setLoadingExpenses(true);

            const unsubscribe = expenseService.subscribeToUserExpenses(
                activeUser.uid,
                (fetchedExpenses: Expense[]) => {
                    setExpenses(fetchedExpenses);
                    setLoadingExpenses(false);
                },
                (error: Error) => {
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

        const handleBudgetEvent = (event: any) => {
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
     * @param {string} gsUri - The GS URI of the file to delete (e.g., gs://bucket/path/to/file).
     */
    const deleteStorageFile = useCallback(async (gsUri: string): Promise<void> => {
        if (!expenseService) {
            console.log("Service not available, skipping deletion.");
            return;
        }
        await expenseService.deleteStorageFile(gsUri);
    }, [expenseService]);

    /**
     * Adds a new expense document to Firestore for the authenticated user.
     * @param {NewExpenseData} newExpense - The expense object to add.
     * @throws {Error} If user is not authenticated or if there's an error adding the document.
     */
    const addExpense = useCallback(async (newExpense: NewExpenseData): Promise<void> => {
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
        } catch (e: any) {
            console.error("Error adding expense: ", e);
            throw e;
        }
    }, [activeUser, expenseService]);

    /**
     * Deletes an expense document from Firestore and its associated receipt from Storage (if any).
     * @param {string} expenseId - The ID of the expense document to delete.
     */
    const deleteExpense = useCallback(async (expenseId: string): Promise<void> => {
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
     * @param {string} expenseId - The ID of the expense document to update.
     * @param {Partial<Expense>} updatedData - An object containing the fields to update.
     * @throws {Error} If user is not authenticated, service is unavailable, or input is invalid.
     */
    const updateExpense = useCallback(async (expenseId: string, updatedData: Partial<Expense>): Promise<void> => {
        if (!activeUser || !expenseService) {
            throw new Error("User not authenticated or service unavailable.");
        }
        if (!expenseId || !updatedData) {
            throw new Error("Expense ID and updated data must be provided.");
        }

        try {
            await expenseService.updateExpense(activeUser.uid, expenseId, updatedData);
            console.log("Expense document successfully updated:", expenseId);
        } catch (e: any) {
            console.error("Error updating expense: ", expenseId, e);
            throw e;
        }
    }, [activeUser, expenseService]);

    const generateShareLink = useCallback(async (): Promise<string> => {
        if (!expenseService || !activeUser) {
            throw new Error("Service not available or user not authenticated.");
        }
        return await expenseService.createSharedExpenseReport(activeUser.uid, expenses);
    }, [expenseService, activeUser, expenses]);

    const getSharedExpenses = useCallback(async (shareId: string): Promise<Expense[]> => {
        if (!expenseService) {
            throw new Error("Service not available.");
        }
        const result = await expenseService.getSharedExpenses(shareId);
        return result?.expenses || [];
    }, [expenseService]);

    const updateExpenseStatus = useCallback(async (
        shareId: string, 
        expenseId: string, 
        status: Expense['status'], 
        denialReason?: string
    ): Promise<void> => {
        if (!expenseService) {
            throw new Error("Service not available.");
        }
        await expenseService.updateSharedExpenseStatus(shareId, expenseId, status, denialReason);
    }, [expenseService]);

    return {
        expenses,
        loadingExpenses,
        addExpense,
        deleteExpense,
        updateExpense,
        deleteStorageFile,
        totalPendingAmount,
        generateShareLink,
        getSharedExpenses,
        updateExpenseStatus
    };
}

// Export the hook as default
export default useExpenseReportService;
