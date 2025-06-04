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
import { httpsCallable, Functions } from "firebase/functions";
import { Expense } from '../types';

type ExpenseAction = 'reimburse' | 'deny';

interface FirebaseFunctionResult {
  data: {
    success: boolean;
    updatedCount?: number;
    error?: string;
    expenses?: Expense[];
  };
}

interface UseSharedExpensesReturn {
  expenses: Expense[];
  loading: boolean;
  error: string;
  selectedExpenses: Set<string>;
  handleSelect: (expenseId: string) => void;
  pendingExpenses: Expense[];
  handleSelectAllPending: () => void;
  updating: boolean;
  updateError: string;
  updateSuccess: string;
  markReimbursed: () => void;
  openDenialModal: () => void;
  denialReasonModalOpen: boolean;
  denialReason: string;
  setDenialReason: (reason: string) => void;
  confirmDenial: () => void;
  closeDenialModal: () => void;
  displayedTotalAmount: number;
}

/**
 * Custom hook to manage expenses for a shared expense report.
 * It fetches expenses using a shareId and Firebase Functions, and allows for
 * updating the status of these expenses (e.g., marking as reimbursed or denied).
 *
 * @param {string} shareId - The unique identifier for the shared expense report.
 * @param {Functions} functions - Firebase Functions instance.
 * @returns {UseSharedExpensesReturn} Hook return object with expenses and management functions
 */
export function useSharedExpenses(shareId: string, functions: Functions): UseSharedExpensesReturn {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
    const [updating, setUpdating] = useState<boolean>(false);
    const [updateError, setUpdateError] = useState<string>('');
    const [updateSuccess, setUpdateSuccess] = useState<string>('');
    const [denialReasonModalOpen, setDenialReasonModalOpen] = useState<boolean>(false);
    const [denialReason, setDenialReason] = useState<string>('');

    /**
     * Fetches expenses associated with the given shareId using a Firebase Function.
     */
    const fetchExpenses = useCallback(async (): Promise<void> => {
        if (!shareId || !functions) {
            setError("Invalid share link or functions not initialized.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        setExpenses([]);
        setSelectedExpenses(new Set());

        try {
            const getSharedExpensesFunction = httpsCallable(functions, 'getSharedExpenses');
            const result = await getSharedExpensesFunction({ shareId }) as FirebaseFunctionResult;
            const fetched = result.data.expenses?.map(exp => ({
                ...exp,
                status: exp.status || 'pending' as const, // Ensure status exists
                denialReason: exp.denialReason || null,
            })) || [];
            setExpenses(fetched);
        } catch (err: any) {
            console.error("[useSharedExpenses] Error fetching:", err);
            setError(`Failed to load expenses: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [shareId, functions]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    /**
     * Toggles the selection state of an expense.
     * Adds the expenseId to `selectedExpenses` if not present, removes it otherwise.
     * @param {string} expenseId - The ID of the expense to select/deselect.
     */
    const handleSelect = useCallback((expenseId: string): void => {
        setSelectedExpenses(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(expenseId)) {
                newSelected.delete(expenseId);
            } else {
                newSelected.add(expenseId);
            }
            return newSelected;
        });
    }, []);

    /** Memoized list of expenses that have a status of 'pending'. */
    const pendingExpenses = useMemo((): Expense[] => 
        expenses.filter(exp => exp.status === 'pending'), [expenses]);

    /**
     * Selects all pending expenses if not all are currently selected,
     * or deselects all if all pending expenses are already selected.
     */
    const handleSelectAllPending = useCallback((): void => {
        const pendingIds = pendingExpenses.map(exp => exp.id);
        const allPendingSelected = pendingIds.length > 0 && pendingIds.every(id => selectedExpenses.has(id));

        if (allPendingSelected) {
            setSelectedExpenses(new Set());
        } else {
            setSelectedExpenses(new Set(pendingIds));
        }
    }, [pendingExpenses, selectedExpenses]);

    /**
     * Performs an update action (reimburse or deny) on the selected expenses
     * by calling a Firebase Function.
     * @param {ExpenseAction} action - The action to perform.
     * @param {string | null} [reason=null] - The reason for denial, if action is 'deny'.
     */
    const performUpdate = useCallback(async (action: ExpenseAction, reason: string | null = null): Promise<void> => {
        if (selectedExpenses.size === 0) {
            setUpdateError("Please select at least one expense.");
            return;
        }
        if (!functions) {
            setUpdateError("Functions not available.");
            return;
        }

        setUpdating(true);
        setUpdateError('');
        setUpdateSuccess('');
        const expenseIdsToUpdate = Array.from(selectedExpenses);

        try {
            const updateStatusFunction = httpsCallable(functions, 'updateSharedExpenseStatus');
            const result = await updateStatusFunction({
                shareId,
                expenseIds: expenseIdsToUpdate,
                action,
                reason: action === 'deny' ? reason : null,
            }) as FirebaseFunctionResult;

            if (result.data.success) {
                if (result.data.updatedCount && result.data.updatedCount > 0) {
                    setUpdateSuccess(`Successfully updated ${result.data.updatedCount} expense(s) to '${action}'.`);
                } else {
                    setUpdateError("Update completed, but no expenses were modified.");
                }
                // Refresh list after update
                await fetchExpenses(); // Re-fetch data
                // Note: fetchExpenses already resets selection
            } else {
                throw new Error(result.data.error || "Update failed on the server.");
            }
        } catch (err: any) {
            console.error(`Error updating expenses to ${action}:`, err);
            setUpdateError(`Failed to update expenses: ${err.message}`);
        } finally {
            setUpdating(false);
            setDenialReasonModalOpen(false);
            setDenialReason('');
        }
    }, [selectedExpenses, functions, shareId, fetchExpenses]);

    /**
     * Marks all currently selected expenses as 'reimbursed'.
     */
    const markReimbursed = useCallback((): void => {
        performUpdate('reimburse');
    }, [performUpdate]);

    /**
     * Opens the modal for entering a reason when denying expenses.
     * Sets an error if no expenses are selected.
     */
    const openDenialModal = useCallback((): void => {
        if (selectedExpenses.size === 0) {
            setUpdateError("Please select at least one expense.");
            return;
        }
        setDenialReasonModalOpen(true);
    }, [selectedExpenses]);

    /**
     * Confirms the denial of selected expenses with the currently set `denialReason`.
     */
    const confirmDenial = useCallback((): void => {
        performUpdate('deny', denialReason);
    }, [performUpdate, denialReason]);

    /**
     * Closes the denial reason modal and clears the `denialReason` state.
     */
    const closeDenialModal = useCallback((): void => {
        setDenialReasonModalOpen(false);
        setDenialReason('');
    }, []);

    /** Memoized total amount of all expenses in the shared report. */
    const displayedTotalAmount = useMemo((): number =>
        expenses.reduce((sum, expense) => sum + (expense.totalAmount || expense.amount || 0), 0),
        [expenses]
    );

    return {
        expenses,
        loading,
        error,
        selectedExpenses,
        handleSelect,
        pendingExpenses,
        handleSelectAllPending,
        updating,
        updateError,
        updateSuccess,
        markReimbursed,
        openDenialModal,
        denialReasonModalOpen,
        denialReason,
        setDenialReason,
        confirmDenial,
        closeDenialModal,
        displayedTotalAmount
    };
}
