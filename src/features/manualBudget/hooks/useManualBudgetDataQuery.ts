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

import { useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserData } from './queries/useUserData';
import { useCategories } from './queries/useCategories';
import { useRecurringExpenses } from './queries/useRecurringExpenses';
import { useMonthSummary } from './queries/useMonthSummary';
import { BudgetCategory } from '../types';

/**
 * Main hook for managing manual budget data using TanStack Query
 * Replaces the original useManualBudgetData hook with query-based state management
 */
export default function useManualBudgetDataQuery() {
    const { activeUser, loading: authLoading } = useAuth();
    const [currentMonth, setCurrentMonthState] = useState<string>(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });

    // User data query
    const {
        userData,
        name,
        needsNamePrompt,
        createUser,
        isCreatingUser,
        isLoading: userDataLoading,
    } = useUserData();

    // Categories query
    const {
        categories,
        isUpdatingCategories,
        addNewMonth,
        isAddingNewMonth,
        isLoading: categoriesLoading,
    } = useCategories(currentMonth);

    // Recurring expenses query
    const {
        recurringExpenses,
        addRecurringExpense,
        deleteRecurringExpense,
        isLoading: recurringExpensesLoading,
    } = useRecurringExpenses();

    // Month summary query
    const {
        monthSummary,
        entries,
        totalBudget,
        totalSpent,
        totalIncome,
        remainingBudget,
        isLoading: summaryLoading,
        refetch: refetchSummary,
    } = useMonthSummary(currentMonth);

    const loading = authLoading || userDataLoading || categoriesLoading || recurringExpensesLoading || summaryLoading;

    /**
     * Returns the current month in YYYY-MM format.
     */
    const getCurrentMonth = useCallback((): string => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    /**
     * Sets the current month and triggers data fetching for that month.
     */
    const setCurrentMonth = useCallback((month: string): void => {
        setCurrentMonthState(month);
    }, []);

    /**
     * Creates a new month with categories from the previous month.
     */
    const addNewMonthWithCategories = useCallback(async (
        month: string, 
        categoriesFromPrevMonth: BudgetCategory[] = []
    ): Promise<void> => {
        return new Promise((resolve, reject) => {
            addNewMonth(
                { newMonth: month, categoriesFromPrevMonth },
                {
                    onSuccess: () => {
                        setCurrentMonth(month);
                        resolve();
                    },
                    onError: (error) => {
                        reject(error);
                    },
                }
            );
        });
    }, [addNewMonth, setCurrentMonth]);

    /**
     * Creates a user document with the provided name.
     */
    const createUserDocument = useCallback(async (userName: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            createUser(userName, {
                onSuccess: () => resolve(),
                onError: (error) => reject(error),
            });
        });
    }, [createUser]);

    /**
     * Adds or updates a recurring expense definition.
     */
    const addRecurringExpenseDefinition = useCallback(async (
        expenseData: any, 
        editingId: string | null = null
    ): Promise<void> => {
        return new Promise((resolve, reject) => {
            addRecurringExpense(
                { expenseData, editingId },
                {
                    onSuccess: () => resolve(),
                    onError: (error) => reject(error),
                }
            );
        });
    }, [addRecurringExpense]);

    /**
     * Deletes a recurring expense definition.
     */
    const deleteRecurringExpenseDefinition = useCallback(async (expenseId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            deleteRecurringExpense(expenseId, {
                onSuccess: () => resolve(),
                onError: (error) => reject(error),
            });
        });
    }, [deleteRecurringExpense]);

    /**
     * Fetches recurring expense definitions (for compatibility).
     */
    const fetchRecurringExpenseDefinitions = useCallback(async () => {
        // Since this is now handled by TanStack Query, we just return the current data
        return recurringExpenses;
    }, [recurringExpenses]);

    return {
        loading,
        name,
        categories: monthSummary?.categories || categories,
        currentMonth,
        needsNamePrompt,
        createUserDocument,
        setCurrentMonth,
        addNewMonth: addNewMonthWithCategories,
        recurringExpensesList: recurringExpenses,
        fetchRecurringExpenseDefinitions,
        addRecurringExpenseDefinition,
        deleteRecurringExpenseDefinition,
        
        // Additional data from TanStack Query
        entries,
        totalBudget,
        totalSpent,
        totalIncome,
        remainingBudget,
        monthSummary,
        
        // Loading states
        isUpdatingCategories,
        isAddingNewMonth,
        isCreatingUser,
        
        // Utility functions
        getCurrentMonth,
        refetchSummary,
    };
}
