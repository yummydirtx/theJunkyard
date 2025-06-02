// Copyright (c) 2025 Alex Frutkin
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (theJunkyard), to deal in
// theJunkyard without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// theJunkyard, and to permit persons to whom theJunkyard is furnished to do so,
// subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of theJunkyard.
// THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ManualBudgetService } from '../services/manualBudgetService';
import { useFinancialEvents } from '../../../shared/hooks/useFinancialEvents';
import { financialEventBus } from '../../../shared/events/financialEventBus';

/**
 * Service-based hook for managing manual budget data for the authenticated user.
 * Uses ManualBudgetService to handle all Firebase operations, promoting clean separation.
 */
export default function useManualBudgetDataService() {
    const { activeUser, db, loading: authLoading } = useAuth();
    const [dataLoading, setDataLoading] = useState(true);
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [currentMonth, setCurrentMonthState] = useState('');
    const [needsNamePrompt, setNeedsNamePrompt] = useState(false);
    const [recurringExpensesList, setRecurringExpensesList] = useState([]);

    // Create service instance
    const budgetService = useMemo(() => {
        return db ? new ManualBudgetService(db) : null;
    }, [db]);

    const loading = authLoading || dataLoading;

    /**
     * Returns the current month in YYYY-MM format.
     */
    const getCurrentMonth = useCallback(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    /**
     * Fetches recurring expense definitions for the current user.
     */
    const fetchRecurringExpenseDefinitions = useCallback(async () => {
        if (!activeUser || !budgetService) {
            setRecurringExpensesList([]);
            return [];
        }
        
        try {
            const definitions = await budgetService.getRecurringExpenseDefinitions(activeUser.uid);
            setRecurringExpensesList(definitions);
            return definitions;
        } catch (error) {
            console.error("Error fetching recurring expense definitions:", error);
            setRecurringExpensesList([]);
            return [];
        }
    }, [activeUser, budgetService]);

    /**
     * Adds or updates a recurring expense definition.
     */
    const addRecurringExpenseDefinition = useCallback(async (expenseData, editingId = null) => {
        if (!activeUser || !budgetService) {
            throw new Error("User not authenticated or service unavailable.");
        }
        
        try {
            await budgetService.saveRecurringExpenseDefinition(activeUser.uid, expenseData, editingId);
            await fetchRecurringExpenseDefinitions(); // Refresh the list
        } catch (error) {
            console.error("Error saving recurring expense definition:", error);
            throw error;
        }
    }, [activeUser, budgetService, fetchRecurringExpenseDefinitions]);

    /**
     * Deletes a recurring expense definition.
     */
    const deleteRecurringExpenseDefinition = useCallback(async (expenseId) => {
        if (!activeUser || !budgetService) {
            throw new Error("User not authenticated or service unavailable.");
        }
        
        try {
            await budgetService.deleteRecurringExpenseDefinition(activeUser.uid, expenseId);
            await fetchRecurringExpenseDefinitions(); // Refresh the list
        } catch (error) {
            console.error("Error deleting recurring expense definition:", error);
            throw error;
        }
    }, [activeUser, budgetService, fetchRecurringExpenseDefinitions]);

    /**
     * Creates a new month document, copying categories and goals from the most recent previous month.
     */
    const createMonthFromPrevious = useCallback(async (userId, newMonth) => {
        if (!userId || !budgetService) {
            return { copiedCategories: [], newMonthTotalGoal: 0 };
        }
        
        try {
            return await budgetService.createMonthFromPrevious(userId, newMonth);
        } catch (error) {
            console.error("Error creating month from previous:", error);
            return { copiedCategories: [], newMonthTotalGoal: 0 };
        }
    }, [budgetService]);

    /**
     * Applies recurring expenses to a specific month.
     */
    const applyRecurringExpensesToMonth = useCallback(async (userId, targetMonth, recurringDefs, monthCategoryNames) => {
        if (!budgetService || !recurringDefs || recurringDefs.length === 0) {
            return { addedTotal: 0 };
        }
        
        try {
            return await budgetService.applyRecurringExpensesToMonth(userId, targetMonth, recurringDefs, monthCategoryNames);
        } catch (error) {
            console.error("Error applying recurring expenses to month:", error);
            return { addedTotal: 0 };
        }
    }, [budgetService]);

    /**
     * Fetches category names for a given user and month.
     */
    const fetchCategories = useCallback(async (userId, month) => {
        if (!userId || !month || !budgetService) {
            setCategories([]);
            return [];
        }
        
        try {
            const categoriesList = await budgetService.getCategories(userId, month);
            setCategories(categoriesList);
            return categoriesList;
        } catch (error) {
            console.error(`Error fetching categories for user ${userId}, month ${month}:`, error);
            setCategories([]);
            return [];
        }
    }, [budgetService]);

    /**
     * Fetches the user's name from the database.
     */
    const fetchUserName = useCallback(async () => {
        if (!activeUser || !budgetService) {
            setName('');
            return;
        }
        
        try {
            const userData = await budgetService.getUserDocument(activeUser.uid);
            if (userData) {
                setName(userData.name || '');
                setNeedsNamePrompt(false);
            } else {
                setNeedsNamePrompt(true);
            }
        } catch (error) {
            console.error("Error fetching user name:", error);
            setNeedsNamePrompt(true);
        }
    }, [activeUser, budgetService]);

    /**
     * Creates a user document with the provided name.
     */
    const createUserDocument = useCallback(async (userName) => {
        if (!activeUser || !budgetService) {
            throw new Error("User not authenticated or service unavailable.");
        }
        
        try {
            await budgetService.createUserDocument(activeUser.uid, userName);
            setName(userName);
            setNeedsNamePrompt(false);
        } catch (error) {
            console.error("Error creating user document:", error);
            throw error;
        }
    }, [activeUser, budgetService]);

    /**
     * Adds a new month with proper setup.
     */
    const addNewMonth = useCallback(async (monthToAdd) => {
        if (!activeUser || !budgetService) return;
        
        try {
            const monthExists = await budgetService.monthExists(activeUser.uid, monthToAdd);
            if (monthExists) {
                console.log(`Month ${monthToAdd} already exists.`);
                return;
            }

            const { copiedCategories, newMonthTotalGoal } = await createMonthFromPrevious(activeUser.uid, monthToAdd);
            
            if (copiedCategories.length > 0) {
                const recurringDefs = await fetchRecurringExpenseDefinitions();
                await applyRecurringExpensesToMonth(activeUser.uid, monthToAdd, recurringDefs, copiedCategories);
            }
            
            await fetchCategories(activeUser.uid, monthToAdd);
        } catch (error) {
            console.error("Error adding new month:", error);
            throw error;
        }
    }, [activeUser, budgetService, createMonthFromPrevious, fetchRecurringExpenseDefinitions, applyRecurringExpensesToMonth, fetchCategories]);

    /**
     * Updates categories for the current month.
     */
    const updateCategories = useCallback(async () => {
        if (activeUser && currentMonth) {
            await fetchCategories(activeUser.uid, currentMonth);
        }
    }, [activeUser, currentMonth, fetchCategories]);

    /**
     * Sets the current month.
     */
    const setCurrentMonth = useCallback((month) => {
        setCurrentMonthState(month);
    }, []);

    // Initialize data when user and service are available
    useEffect(() => {
        let isMounted = true;
        
        const initializeData = async () => {
            if (!activeUser || !budgetService) {
                setDataLoading(false);
                return;
            }

            setDataLoading(true);
            
            try {
                const month = getCurrentMonth();
                setCurrentMonthState(month);
                
                // Fetch user data and categories in parallel
                await Promise.all([
                    fetchUserName(),
                    fetchCategories(activeUser.uid, month),
                    fetchRecurringExpenseDefinitions()
                ]);
            } catch (error) {
                console.error("Error initializing manual budget data:", error);
            } finally {
                if (isMounted) {
                    setDataLoading(false);
                }
            }
        };

        initializeData();
        
        return () => {
            isMounted = false;
        };
    }, [activeUser, budgetService, getCurrentMonth, fetchUserName, fetchCategories, fetchRecurringExpenseDefinitions]);

    // Auto-fix current month if needed (check and create missing categories)
    useEffect(() => {
        let timerId;
        
        const checkAndFixCurrentMonth = async () => {
            if (!activeUser || !budgetService || !currentMonth) return;
            
            try {
                const currentCategories = await budgetService.getCategories(activeUser.uid, currentMonth);
                
                if (currentCategories.length === 0) {
                    // No categories found, try to copy from previous month
                    const months = await budgetService.getAvailableMonths(activeUser.uid);
                    const previousMonths = months.filter(month => month < currentMonth);
                    
                    if (previousMonths.length > 0) {
                        const sourceMonth = previousMonths[0]; // Most recent previous month
                        const sourceCategories = await budgetService.getCategories(activeUser.uid, sourceMonth);
                        
                        if (sourceCategories.length > 0) {
                            await createMonthFromPrevious(activeUser.uid, currentMonth);
                            await fetchCategories(activeUser.uid, currentMonth);
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking and fixing current month:", error);
            }
        };
        
        if (!loading && activeUser && currentMonth && budgetService) {
            timerId = setTimeout(checkAndFixCurrentMonth, 600);
        }
        
        return () => clearTimeout(timerId);
    }, [activeUser, currentMonth, budgetService, loading, createMonthFromPrevious, fetchCategories]);

    // Listen for expense-related events to potentially update budget summaries
    useEffect(() => {
        if (!activeUser) return;

        const handleExpenseEvent = (event) => {
            // When expenses are added/updated/deleted, we might want to refresh categories
            // to show updated totals if there are any budget-expense integrations
            if (currentMonth && event.payload?.userId === activeUser.uid) {
                // Optional: refresh categories when expense events occur
                // This could be useful for future integrations between expense and budget features
                console.log('Expense event received in budget hook:', event.type);
            }
        };

        const unsubscribe = financialEventBus.subscribe('expense.*', handleExpenseEvent);
        return unsubscribe;
    }, [activeUser, currentMonth]);

    return {
        loading,
        name,
        categories,
        currentMonth,
        updateCategories,
        needsNamePrompt,
        createUserDocument,
        setCurrentMonth,
        addNewMonth,
        recurringExpensesList,
        fetchRecurringExpenseDefinitions,
        addRecurringExpenseDefinition,
        deleteRecurringExpenseDefinition,
    };
}
