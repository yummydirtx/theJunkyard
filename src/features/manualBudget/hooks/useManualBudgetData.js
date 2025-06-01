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

import { useState, useEffect, useCallback } from 'react';
import {
    doc, getDoc, getDocs, collection, setDoc, addDoc,
    updateDoc, deleteDoc, serverTimestamp, writeBatch, query, orderBy // Added query, orderBy
} from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Custom hook for managing manual budget data for the authenticated user.
 * Handles fetching user's name, budget categories, recurring expenses,
 * creating new months (including generating recurring entries), and managing name prompts.
 */
export default function useManualBudgetData() {
    const { activeUser, db, loading: authLoading } = useAuth();
    const [dataLoading, setDataLoading] = useState(true);
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [currentMonth, setCurrentMonthState] = useState('');
    const [needsNamePrompt, setNeedsNamePrompt] = useState(false);

    // --- State for recurring expenses ---
    const [recurringExpensesList, setRecurringExpensesList] = useState([]);
    // --- End recurring expenses state ---

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
        if (!activeUser || !db) {
            setRecurringExpensesList([]);
            return [];
        }
        // console.log(`[useManualBudgetData] Fetching recurring expenses for user ${activeUser.uid}`);
        try {
            const recurringExpensesPath = `manualBudget/${activeUser.uid}/recurringExpenses`;
            const q = query(collection(db, recurringExpensesPath), orderBy('description', 'asc'));
            const snapshot = await getDocs(q);
            const definitions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecurringExpensesList(definitions);
            // console.log(`[useManualBudgetData] Fetched ${definitions.length} recurring expenses.`);
            return definitions;
        } catch (error) {
            console.error("Error fetching recurring expense definitions:", error);
            setRecurringExpensesList([]);
            return [];
        }
    }, [activeUser, db]);

    /**
     * Adds or updates a recurring expense definition.
     * @param {object} expenseData - The data for the recurring expense.
     * @param {string|null} editingId - The ID of the expense if updating, null if adding.
     */
    const addRecurringExpenseDefinition = useCallback(async (expenseData, editingId = null) => {
        if (!activeUser || !db) throw new Error("User not authenticated or DB unavailable.");
        console.log(`[addRecurringExpenseDefinition] Called with expenseData:`, expenseData, `editingId: ${editingId}`);

        const dataToSave = {
            ...expenseData,
            userId: activeUser.uid,
            updatedAt: serverTimestamp(),
        };

        try {
            const recurringExpensesColRef = collection(db, `manualBudget/${activeUser.uid}/recurringExpenses`);
            if (editingId) {
                console.log(`[addRecurringExpenseDefinition] Updating recurring expense ID: ${editingId} with data:`, dataToSave);
                const docRef = doc(recurringExpensesColRef, editingId);
                await updateDoc(docRef, dataToSave);
                console.log(`[addRecurringExpenseDefinition] Successfully updated recurring expense ID: ${editingId}`);
            } else {
                dataToSave.createdAt = serverTimestamp();
                console.log(`[addRecurringExpenseDefinition] Adding new recurring expense with data:`, dataToSave);
                const docRef = await addDoc(recurringExpensesColRef, dataToSave);
                console.log(`[addRecurringExpenseDefinition] Successfully added new recurring expense with ID: ${docRef.id}`);
            }
            console.log("[addRecurringExpenseDefinition] Refreshing recurring expense definitions list.");
            await fetchRecurringExpenseDefinitions(); // Refresh the list
        } catch (error) {
            console.error("[addRecurringExpenseDefinition] Error saving recurring expense definition:", error);
            throw error;
        }
    }, [activeUser, db, fetchRecurringExpenseDefinitions]);

    /**
     * Deletes a recurring expense definition.
     * @param {string} expenseId - The ID of the recurring expense to delete.
     */
    const deleteRecurringExpenseDefinition = useCallback(async (expenseId) => {
        if (!activeUser || !db) throw new Error("User not authenticated or DB unavailable.");
        // console.log(`[useManualBudgetData] Deleting recurring expense ID: ${expenseId}`);
        try {
            const docRef = doc(db, `manualBudget/${activeUser.uid}/recurringExpenses`, expenseId);
            await deleteDoc(docRef);
            await fetchRecurringExpenseDefinitions(); // Refresh the list
        } catch (error) {
            console.error("Error deleting recurring expense definition:", error);
            throw error;
        }
    }, [activeUser, db, fetchRecurringExpenseDefinitions]);


    /**
     * Creates a new month document, copying categories and goals from the most recent previous month.
     * @param {string} userId - The user's ID.
     * @param {string} newMonth - The month to create (YYYY-MM).
     * @returns {Promise<{copiedCategories: Array<string>, newMonthTotalGoal: number}>}
     */
    const createMonthFromPrevious = useCallback(async (userId, newMonth) => {
        if (!userId || !db) return { copiedCategories: [], newMonthTotalGoal: 0 };
        // console.log(`[useManualBudgetData] createMonthFromPrevious for user ${userId}, newMonth ${newMonth}`);
        let newMonthTotalGoal = 0;
        const copiedCategories = [];

        try {
            const monthsCollectionRef = collection(db, `manualBudget/${userId}/months`);
            const monthsSnapshot = await getDocs(monthsCollectionRef);
            const monthsList = monthsSnapshot.docs.map(doc => doc.id).sort((a, b) => b.localeCompare(a));
            const previousMonths = monthsList.filter(month => month < newMonth); // Ensure we only look at past months

            const newMonthDocRef = doc(db, `manualBudget/${userId}/months/${newMonth}`);
            // Initialize new month document with goal and total
            await setDoc(newMonthDocRef, {
                total: 0,
                goal: 0,
                createdAt: serverTimestamp()
            });
            // console.log(`[useManualBudgetData] Initialized new month doc for ${newMonth} with 0 goal and total.`);

            if (previousMonths.length > 0) {
                const mostRecentPreviousMonth = previousMonths[0];
                // console.log(`[useManualBudgetData] Using ${mostRecentPreviousMonth} as template for ${newMonth}`);
                const prevCategoriesPath = `manualBudget/${userId}/months/${mostRecentPreviousMonth}/categories`;
                const prevCategoriesSnapshot = await getDocs(collection(db, prevCategoriesPath));

                if (!prevCategoriesSnapshot.empty) {
                    const batch = writeBatch(db);
                    prevCategoriesSnapshot.forEach(categoryDoc => {
                        const categoryName = categoryDoc.id;
                        const categoryData = categoryDoc.data() || {};
                        const goalValue = typeof categoryData.goal === 'number' ? categoryData.goal : 0;
                        const colorValue = categoryData.color || '#1976d2'; // Default color

                        copiedCategories.push(categoryName);
                        newMonthTotalGoal += goalValue;

                        const newCategoryDocRef = doc(db, `manualBudget/${userId}/months/${newMonth}/categories/${categoryName}`);
                        batch.set(newCategoryDocRef, {
                            goal: goalValue,
                            total: 0, // Entries will update this
                            createdAt: serverTimestamp(),
                            color: colorValue
                        });
                    });
                    await batch.commit();
                    // console.log(`[useManualBudgetData] Copied ${copiedCategories.length} categories to ${newMonth}. Total goal from copied: ${newMonthTotalGoal}`);
                } else {
                    // console.log(`[useManualBudgetData] No categories in template month ${mostRecentPreviousMonth}.`);
                }
            } else {
                // console.log(`[useManualBudgetData] No previous months to copy categories from for ${newMonth}.`);
            }

            // Update the new month's total goal based on copied categories
            if (newMonthTotalGoal > 0) {
                await updateDoc(newMonthDocRef, { goal: newMonthTotalGoal });
                // console.log(`[useManualBudgetData] Updated ${newMonth} total goal to ${newMonthTotalGoal}`);
            }
            return { copiedCategories, newMonthTotalGoal };
        } catch (error) {
            console.error(`Error in createMonthFromPrevious for ${newMonth}:`, error);
            return { copiedCategories: [], newMonthTotalGoal: 0 }; // Return default on error
        }
    }, [db]);


    /**
     * Applies recurring expense definitions to a given month.
     * Creates entries and updates totals.
     */
    const applyRecurringExpensesToMonth = useCallback(async (userId, targetMonth, recurringDefs, monthCategoryNames) => {
        if (!db || !userId || !targetMonth || !recurringDefs || recurringDefs.length === 0) {
            //console.log('[applyRecurringExpensesToMonth] Missing parameters or no definitions, skipping.');
            return { addedTotal: 0 };
        }
        //console.log(`[applyRecurringExpensesToMonth] Applying ${recurringDefs.length} recurring expenses to ${targetMonth} for user ${userId}`);

        const batch = writeBatch(db);
        const [year, monthIndexBase1] = targetMonth.split('-').map(Number);
        const monthIndexBase0 = monthIndexBase1 - 1;
        let addedRecurringExpensesTotalAmount = 0;
        const categoryRecurringAmounts = {};

        for (const def of recurringDefs) {
            if (!monthCategoryNames.includes(def.categoryId)) {
                //console.warn(`[applyRecurringExpensesToMonth] Recurring expense category "${def.categoryId}" not found in month "${targetMonth}". Skipping.`);
                continue;
            }

            let expenseDate;
            if (def.recurrenceType === 'lastDay') {
                expenseDate = new Date(year, monthIndexBase0 + 1, 0); // JS Date: month is 0-indexed, day 0 of next month = last day of current
            } else {
                const lastDayOfMonth = new Date(year, monthIndexBase0 + 1, 0).getDate();
                const day = Math.min(def.dayOfMonth, lastDayOfMonth);
                expenseDate = new Date(year, monthIndexBase0, day);
            }

            const entryData = {
                amount: def.amount,
                date: expenseDate, // Firestore will convert to Timestamp
                description: `Recurring: ${def.description}`,
                createdAt: serverTimestamp(),
                isRecurring: true,
                recurringExpenseDefId: def.id
            };

            const entryRef = doc(collection(db, `manualBudget/${userId}/months/${targetMonth}/categories/${def.categoryId}/entries`));
            batch.set(entryRef, entryData);
            addedRecurringExpensesTotalAmount += def.amount;
            categoryRecurringAmounts[def.categoryId] = (categoryRecurringAmounts[def.categoryId] || 0) + def.amount;
            // console.log(`[applyRecurringExpensesToMonth] Queued recurring entry: ${entryData.description} for ${def.categoryId} on ${expenseDate.toLocaleDateString()}`);
        }

        if (addedRecurringExpensesTotalAmount > 0) {
            await batch.commit();
            // console.log(`[applyRecurringExpensesToMonth] Committed batch of recurring entries for ${targetMonth}. Total amount: ${addedRecurringExpensesTotalAmount}`);

            const categoryUpdatePromises = [];
            for (const categoryId in categoryRecurringAmounts) {
                const amountToAdd = categoryRecurringAmounts[categoryId];
                const categoryDocRef = doc(db, `manualBudget/${userId}/months/${targetMonth}/categories/${categoryId}`);
                categoryUpdatePromises.push(
                    getDoc(categoryDocRef).then(categorySnap => {
                        if (categorySnap.exists()) {
                            const currentCategoryTotal = categorySnap.data().total || 0;
                            return updateDoc(categoryDocRef, { total: currentCategoryTotal + amountToAdd });
                        }
                    })
                );
            }
            await Promise.all(categoryUpdatePromises);
            // console.log(`[applyRecurringExpensesToMonth] Updated category totals for ${targetMonth}.`);

            const monthDocRef = doc(db, `manualBudget/${userId}/months/${targetMonth}`);
            const monthSnap = await getDoc(monthDocRef);
            const currentMonthTotalSpent = monthSnap.exists() ? (monthSnap.data().total || 0) : 0;
            const finalMonthTotalSpent = currentMonthTotalSpent + addedRecurringExpensesTotalAmount;
            await updateDoc(monthDocRef, { total: finalMonthTotalSpent });
            // console.log(`[applyRecurringExpensesToMonth] Updated ${targetMonth} total spent to ${finalMonthTotalSpent}.`);
        } else {
            // console.log('[applyRecurringExpensesToMonth] No recurring expenses were applicable or added.');
        }
        return { addedTotal: addedRecurringExpensesTotalAmount };
    }, [db]);


    /**
     * Fetches category names for a given user and month.
     */
    const fetchCategories = useCallback(async (userId, month) => {
        if (!userId || !month || !db) {
            setCategories([]);
            return [];
        }
        try {
            const categoriesPath = `manualBudget/${userId}/months/${month}/categories`;
            const categoriesSnapshot = await getDocs(collection(db, categoriesPath));
            const categoriesList = categoriesSnapshot.docs.map(doc => doc.id);
            setCategories(categoriesList);
            return categoriesList;
        } catch (error) {
            console.error(`Error fetching categories for user ${userId}, month ${month}:`, error);
            setCategories([]);
            return [];
        }
    }, [db]);

    /**
     * Effect for initial data loading (user name, current month categories, recurring expenses).
     */
    useEffect(() => {
        // console.log(`[processUser Effect Trigger] authLoading: ${authLoading}, activeUser?.uid: ${activeUser?.uid}`);
        if (authLoading) {
            setDataLoading(true);
            return;
        }
        const timerId = setTimeout(() => { // Debounce to allow Firestore rules to propagate
            setDataLoading(true);
            const processUser = async () => {
                const currentUser = activeUser;
                const currentDb = db;
                if (currentUser && currentDb) {
                    const userIdForProcess = currentUser.uid;
                    try {
                        const userDocRef = doc(currentDb, 'manualBudget', userIdForProcess);
                        const userDocSnap = await getDoc(userDocRef);
                        if (userDocSnap.exists()) {
                            setName(userDocSnap.data().name || '');
                            setNeedsNamePrompt(!userDocSnap.data().name);
                        } else {
                            setName('');
                            setNeedsNamePrompt(true);
                        }

                        const calendarMonth = getCurrentMonth();
                        const calendarMonthDocRef = doc(currentDb, `manualBudget/${userIdForProcess}/months/${calendarMonth}`);
                        const calendarMonthDocSnap = await getDoc(calendarMonthDocRef);
                        let monthToLoad = calendarMonth;

                        if (!calendarMonthDocSnap.exists()) {
                            // console.log(`[useManualBudgetData] Initial load: Month ${calendarMonth} does not exist. Creating.`);
                            const { copiedCategories /*, newMonthTotalGoal */ } = await createMonthFromPrevious(userIdForProcess, calendarMonth);
                            monthToLoad = calendarMonth; // Ensure monthToLoad is the newly created month

                            // Apply recurring expenses to this newly created month
                            const definitions = await fetchRecurringExpenseDefinitions(); // Fetches and sets recurringExpensesList
                            if (definitions && definitions.length > 0) {
                                console.log(`[processUser/useEffect] Applying recurring expenses to newly created month ${monthToLoad}.`);
                                await applyRecurringExpensesToMonth(
                                    userIdForProcess,
                                    monthToLoad,
                                    definitions,
                                    copiedCategories // Categories created by createMonthFromPrevious
                                );
                            }
                        }

                        setCurrentMonthState(monthToLoad);
                        await fetchCategories(userIdForProcess, monthToLoad);
                        await fetchRecurringExpenseDefinitions(); // Fetch recurring definitions
                    } catch (error) {
                        console.error(`[processUser] Error for user ${userIdForProcess}:`, error);
                        setName(''); setCategories([]); setCurrentMonthState(getCurrentMonth());
                        setNeedsNamePrompt(false); setRecurringExpensesList([]);
                    } finally {
                        setDataLoading(false);
                    }
                } else {
                    setName(''); setCategories([]); setCurrentMonthState(getCurrentMonth());
                    setNeedsNamePrompt(false); setRecurringExpensesList([]);
                    setDataLoading(false);
                }
            };
            processUser();
        }, 150); // Slightly increased delay
        return () => clearTimeout(timerId);
    }, [activeUser, db, authLoading, getCurrentMonth, createMonthFromPrevious, fetchCategories, fetchRecurringExpenseDefinitions, applyRecurringExpensesToMonth]);


    const updateCategories = useCallback((newCategories) => {
        setCategories(newCategories);
    }, []);


    const createUserDocument = useCallback(async (userId, userName) => {
        if (!userId || !db) return;
        try {
            await setDoc(doc(db, 'manualBudget', userId), { name: userName });
            const thisMonth = getCurrentMonth();
            // Ensure the first month is created with initial goal and total
            await setDoc(doc(db, `manualBudget/${userId}/months/${thisMonth}`), {
                total: 0,
                goal: 0,
                createdAt: serverTimestamp()
            }, { merge: true });

            setName(userName);
            setNeedsNamePrompt(false);
            setCurrentMonthState(thisMonth);
            await fetchCategories(userId, thisMonth);
            await fetchRecurringExpenseDefinitions(); // Also fetch recurring defs
        } catch (error) {
            console.error(`Error creating user document for user ${userId}:`, error);
        }
    }, [db, getCurrentMonth, fetchCategories, fetchRecurringExpenseDefinitions]);


    const setCurrentMonth = useCallback(async (month) => {
        if (!activeUser) {
            setCurrentMonthState(month);
            setCategories([]);
            return;
        }
        setCurrentMonthState(month);
        await fetchCategories(activeUser.uid, month);
        // Optionally, re-fetch recurring expenses if they could change per month,
        // but definitions are usually user-wide.
    }, [activeUser, fetchCategories]);

    /**
     * Adds a new month, copies categories/goals, and generates recurring expense entries.
     * @param {string} newMonth - The month to add (YYYY-MM).
     */
    const addNewMonth = useCallback(async (newMonth) => {
        if (!activeUser || !db) return false;
        // console.log(`[useManualBudgetData] addNewMonth called for ${newMonth}`);
        try {
            const monthDocRef = doc(db, `manualBudget/${activeUser.uid}/months/${newMonth}`);
            const monthSnap = await getDoc(monthDocRef);
            let categoriesForNewMonth = [];
            // let currentMonthTotalSpent = 0; // Not needed here, applyRecurringExpensesToMonth handles it
            // let currentMonthTotalGoal = 0; // Not needed here


            if (!monthSnap.exists()) {
                // console.log(`[useManualBudgetData] Month ${newMonth} does not exist. Creating from previous.`);
                const { copiedCategories /*, newMonthTotalGoal */ } = await createMonthFromPrevious(activeUser.uid, newMonth);
                categoriesForNewMonth = copiedCategories;
                // currentMonthTotalGoal = newMonthTotalGoal;
            } else {
                // console.log(`[useManualBudgetData] Month ${newMonth} already exists. Fetching its categories and totals.`);
                categoriesForNewMonth = await fetchCategories(activeUser.uid, newMonth);
                // const existingMonthData = monthSnap.data();
                // currentMonthTotalSpent = existingMonthData?.total || 0;
                // currentMonthTotalGoal = existingMonthData?.goal || 0;
            }

            // Fetch all recurring expense definitions for the user
            const definitions = await fetchRecurringExpenseDefinitions(); // Uses the hook's state or re-fetches
            // console.log(`[useManualBudgetData] Fetched ${definitions.length} recurring expense definitions for ${newMonth} generation.`);

            if (definitions.length > 0) {
                // console.log(`[addNewMonth] Applying recurring expenses to month ${newMonth}.`);
                await applyRecurringExpensesToMonth(
                    activeUser.uid,
                    newMonth,
                    definitions,
                    categoriesForNewMonth
                );
            } else {
                // console.log(`[addNewMonth] No recurring expense definitions to apply for ${newMonth}.`);
            }

            setCurrentMonthState(newMonth);
            await fetchCategories(activeUser.uid, newMonth); // Refreshes categories for the new current month
            return true;
        } catch (error) {
            console.error(`Error in addNewMonth for ${newMonth}:`, error);
            return false;
        }
    }, [activeUser, db, createMonthFromPrevious, fetchCategories, fetchRecurringExpenseDefinitions, applyRecurringExpensesToMonth, setCurrentMonthState]);


    // Effect to check and fix current month if it has no categories (self-healing)
    useEffect(() => {
        let timerId;
        const checkAndFixCurrentMonth = async () => {
            const userForCheck = activeUser;
            const monthForCheck = currentMonth;
            const dbForCheck = db;

            if (loading || !userForCheck || !monthForCheck || !dbForCheck) return;
            const userIdForCheck = userForCheck.uid;
            // console.log(`[checkAndFixCurrentMonth] Running for user: ${userIdForCheck}, month: ${monthForCheck}`);
            try {
                const categoriesPath = `manualBudget/${userIdForCheck}/months/${monthForCheck}/categories`;
                const categoriesSnapshot = await getDocs(collection(dbForCheck, categoriesPath));

                if (categoriesSnapshot.empty) {
                    // console.warn(`[checkAndFixCurrentMonth] Detected empty categories for ${monthForCheck}. Attempting fix for user ${userIdForCheck}.`);
                    // Attempt to copy from the most recent previous month that has categories
                    const monthsCollection = collection(db, `manualBudget/${userIdForCheck}/months`);
                    const monthsSnapshot = await getDocs(monthsCollection);
                    const monthsList = monthsSnapshot.docs.map(doc => doc.id).sort((a, b) => b.localeCompare(a));
                    const otherMonths = monthsList.filter(month => month < monthForCheck); // Only look at past months

                    let sourceMonth = null;
                    for (const month of otherMonths) {
                        const monthCategoriesPath = `manualBudget/${userIdForCheck}/months/${month}/categories`;
                        const monthCategoriesSnapshot = await getDocs(collection(db, monthCategoriesPath));
                        if (!monthCategoriesSnapshot.empty) {
                            sourceMonth = month;
                            break;
                        }
                    }

                    if (sourceMonth) {
                        // console.log(`[checkAndFixCurrentMonth] Found source month ${sourceMonth} with categories.`);
                        const sourceCategoriesPath = `manualBudget/${userIdForCheck}/months/${sourceMonth}/categories`;
                        const sourceCategoriesSnapshot = await getDocs(collection(db, sourceCategoriesPath));
                        const batch = writeBatch(db);
                        let fixTotalGoal = 0;
                        sourceCategoriesSnapshot.forEach(categoryDoc => {
                            const categoryName = categoryDoc.id;
                            const categoryData = categoryDoc.data() || {};
                            const goalValue = typeof categoryData.goal === 'number' ? categoryData.goal : 0;
                            const colorValue = categoryData.color || '#1976d2';
                            fixTotalGoal += goalValue;
                            batch.set(doc(db, categoriesPath, categoryName), {
                                goal: goalValue, total: 0, createdAt: serverTimestamp(), color: colorValue
                            });
                        });
                        await batch.commit();
                        // Update month's goal if categories were copied
                        if (fixTotalGoal > 0) {
                            const monthDocRef = doc(db, `manualBudget/${userIdForCheck}/months/${monthForCheck}`);
                            await updateDoc(monthDocRef, { goal: fixTotalGoal }, {merge: true});
                        }
                        // console.log(`[checkAndFixCurrentMonth] Fixed: Copied categories from ${sourceMonth} to ${monthForCheck}. New goal: ${fixTotalGoal}`);
                        await fetchCategories(userIdForCheck, monthForCheck); // Refresh categories state
                    } else {
                        // console.warn(`[checkAndFixCurrentMonth] Could not find any previous month with categories to fix ${monthForCheck}.`);
                        setCategories([]);
                    }
                }
            } catch (error) {
                console.error(`[checkAndFixCurrentMonth] Error for user ${userIdForCheck}, month ${monthForCheck}:`, error);
            }
        };
        if (!loading && activeUser && currentMonth && db) {
            timerId = setTimeout(checkAndFixCurrentMonth, 600); // Slightly longer delay
        }
        return () => clearTimeout(timerId);
    }, [activeUser, currentMonth, db, loading, fetchCategories]);


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
