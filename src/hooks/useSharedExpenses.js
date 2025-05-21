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
import { getFunctions, httpsCallable } from "firebase/functions";

/**
 * Custom hook to manage expenses for a shared expense report.
 * It fetches expenses using a shareId and Firebase Functions, and allows for
 * updating the status of these expenses (e.g., marking as reimbursed or denied).
 *
 * @param {string} shareId - The unique identifier for the shared expense report.
 * @param {object} functions - Firebase Functions instance.
 * @returns {object} An object containing:
 *  - `expenses` {Array<object>}: The list of expenses for the shared report.
 *  - `loading` {boolean}: Loading state for fetching expenses.
 *  - `error` {string}: Error message if fetching fails.
 *  - `selectedExpenses` {Set<string>}: A Set of IDs of the currently selected expenses.
 *  - `handleSelect` {function}: Function to toggle the selection of an expense.
 *  - `pendingExpenses` {Array<object>}: A memoized list of expenses with 'pending' status.
 *  - `handleSelectAllPending` {function}: Function to select or deselect all pending expenses.
 *  - `updating` {boolean}: Loading state for when an update operation is in progress.
 *  - `updateError` {string}: Error message if an update operation fails.
 *  - `updateSuccess` {string}: Success message after an update operation.
 *  - `markReimbursed` {function}: Function to mark selected expenses as reimbursed.
 *  - `openDenialModal` {function}: Function to open the modal for entering a denial reason.
 *  - `denialReasonModalOpen` {boolean}: State of the denial reason modal (open/closed).
 *  - `denialReason` {string}: The reason for denial entered by the user.
 *  - `setDenialReason` {function}: Function to update the denialReason state.
 *  - `confirmDenial` {function}: Function to confirm and mark selected expenses as denied with the given reason.
 *  - `closeDenialModal` {function}: Function to close the denial reason modal.
 *  - `displayedTotalAmount` {number}: The total sum of amounts for all displayed expenses in the shared report.
 */
export function useSharedExpenses(shareId, functions) {
    /** @state {Array<object>} expenses - List of expenses fetched for the shared report. */
    const [expenses, setExpenses] = useState([]);
    /** @state {boolean} loading - True if shared expenses are currently being fetched. */
    const [loading, setLoading] = useState(true);
    /** @state {string} error - Stores error messages related to fetching shared expenses. */
    const [error, setError] = useState('');
    /** @state {Set<string>} selectedExpenses - A Set containing the IDs of expenses selected by the user. */
    const [selectedExpenses, setSelectedExpenses] = useState(new Set());
    /** @state {boolean} updating - True if an update operation (reimburse/deny) is in progress. */
    const [updating, setUpdating] = useState(false);
    /** @state {string} updateError - Stores error messages related to updating expense statuses. */
    const [updateError, setUpdateError] = useState('');
    /** @state {string} updateSuccess - Stores success messages after updating expense statuses. */
    const [updateSuccess, setUpdateSuccess] = useState('');
    /** @state {boolean} denialReasonModalOpen - Controls the visibility of the denial reason input modal. */
    const [denialReasonModalOpen, setDenialReasonModalOpen] = useState(false);
    /** @state {string} denialReason - The reason provided when denying an expense. */
    const [denialReason, setDenialReason] = useState('');

    /**
     * Fetches expenses associated with the given shareId using a Firebase Function.
     * @async
     */
    const fetchExpenses = useCallback(async () => {
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
            const result = await getSharedExpensesFunction({ shareId });
            const fetched = result.data.expenses.map(exp => ({
                ...exp,
                status: exp.status || 'pending', // Ensure status exists
                denialReason: exp.denialReason || null,
            }));
            setExpenses(fetched);
        } catch (err) {
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
    const handleSelect = useCallback((expenseId) => {
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

    /** @type {Array<object>} Memoized list of expenses that have a status of 'pending'. */
    const pendingExpenses = useMemo(() => expenses.filter(exp => exp.status === 'pending'), [expenses]);

    /**
     * Selects all pending expenses if not all are currently selected,
     * or deselects all if all pending expenses are already selected.
     */
    const handleSelectAllPending = useCallback(() => {
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
     * @async
     * @param {('reimburse'|'deny')} action - The action to perform.
     * @param {string|null} [reason=null] - The reason for denial, if action is 'deny'.
     */
    const performUpdate = useCallback(async (action, reason = null) => {
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
            });

            if (result.data.success) {
                if (result.data.updatedCount > 0) {
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
        } catch (err) {
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
    const markReimbursed = useCallback(() => {
        performUpdate('reimburse');
    }, [performUpdate]);

    /**
     * Opens the modal for entering a reason when denying expenses.
     * Sets an error if no expenses are selected.
     */
    const openDenialModal = useCallback(() => {
        if (selectedExpenses.size === 0) {
            setUpdateError("Please select at least one expense.");
            return;
        }
        setDenialReasonModalOpen(true);
    }, [selectedExpenses]);

    /**
     * Confirms the denial of selected expenses with the currently set `denialReason`.
     */
    const confirmDenial = useCallback(() => {
        performUpdate('deny', denialReason);
    }, [performUpdate, denialReason]);

    /**
     * Closes the denial reason modal and clears the `denialReason` state.
     */
    const closeDenialModal = useCallback(() => {
        setDenialReasonModalOpen(false);
        setDenialReason('');
    }, []);

    /** @type {number} Memoized total amount of all expenses in the shared report. */
    const displayedTotalAmount = useMemo(() =>
        expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
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
