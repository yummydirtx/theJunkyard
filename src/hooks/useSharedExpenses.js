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

export function useSharedExpenses(shareId, functions) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedExpenses, setSelectedExpenses] = useState(new Set());
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [denialReasonModalOpen, setDenialReasonModalOpen] = useState(false);
    const [denialReason, setDenialReason] = useState('');

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
    }, [fetchExpenses]); // fetchExpenses includes shareId and functions dependencies

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

    const pendingExpenses = useMemo(() => expenses.filter(exp => exp.status === 'pending'), [expenses]);

    const handleSelectAllPending = useCallback(() => {
        const pendingIds = pendingExpenses.map(exp => exp.id);
        const allPendingSelected = pendingIds.length > 0 && pendingIds.every(id => selectedExpenses.has(id));

        if (allPendingSelected) {
            setSelectedExpenses(new Set());
        } else {
            setSelectedExpenses(new Set(pendingIds));
        }
    }, [pendingExpenses, selectedExpenses]);

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

    const markReimbursed = useCallback(() => {
        performUpdate('reimburse');
    }, [performUpdate]);

    const openDenialModal = useCallback(() => {
        if (selectedExpenses.size === 0) {
            setUpdateError("Please select at least one expense.");
            return;
        }
        setDenialReasonModalOpen(true);
    }, [selectedExpenses]);

    const confirmDenial = useCallback(() => {
        performUpdate('deny', denialReason);
    }, [performUpdate, denialReason]);

    const closeDenialModal = useCallback(() => {
        setDenialReasonModalOpen(false);
        setDenialReason('');
    }, []);

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
