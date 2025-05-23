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
// Remove Firebase auth imports, use context instead
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocs, collection, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

/**
 * Custom hook for managing data fetching in ManualBudget using AuthContext
 * @returns {Object} - Object containing user data, loading state, and budget data
 */
export default function useManualBudgetData() { // Remove app parameter
    const { activeUser, db, loading: authLoading } = useAuth(); // Get user, db, and loading state from context
    // const auth = getAuth(app); // Remove internal auth
    // const db = getFirestore(app); // Get db from context
    // const [user, setUser] = useState(auth.currentUser); // Remove internal user state
    const [dataLoading, setDataLoading] = useState(true); // Rename internal loading state
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [currentMonth, setCurrentMonthState] = useState('');
    const [needsNamePrompt, setNeedsNamePrompt] = useState(false);

    const loading = authLoading || dataLoading; // Combine loading states

    // Get current month in YYYY-MM format
    const getCurrentMonth = useCallback(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    // Create a new month by copying categories and goals from the most recent previous month
    const createMonthFromPrevious = useCallback(async (userId, newMonth) => {
        if (!userId || !db) return []; // Check passed userId

        try {
            // console.log(`Creating new month ${newMonth} for user ${userId} based on previous month data`);

            // Get all existing months for the user
            const monthsCollection = collection(db, `manualBudget/${userId}/months`); // Use passed userId
            const monthsSnapshot = await getDocs(monthsCollection);
            const monthsList = monthsSnapshot.docs.map(doc => doc.id);

            // Sort months in descending order (newest first)
            monthsList.sort((a, b) => b.localeCompare(a));

            // Filter out the current month (which doesn't exist yet)
            const previousMonths = monthsList.filter(month => month !== newMonth);

            if (previousMonths.length === 0) {
                // No previous months, create empty month document
                // console.log(`No previous months found for ${userId}. Creating empty month ${newMonth}.`);
                await setDoc(doc(db, `manualBudget/${userId}/months/${newMonth}`), {
                    total: 0,
                    createdAt: new Date()
                });
                return []; // Return empty categories array
            }

            // Get most recent month
            const mostRecentMonth = previousMonths[0];
            // console.log(`Using ${mostRecentMonth} as template for new month ${newMonth}`);

            // Create the new month document
            await setDoc(doc(db, `manualBudget/${userId}/months/${newMonth}`), {
                total: 0, // Start with zero total
                createdAt: new Date()
            });

            // Copy categories and goals from previous month
            const prevCategoriesPath = `manualBudget/${userId}/months/${mostRecentMonth}/categories`;
            const prevCategoriesSnapshot = await getDocs(collection(db, prevCategoriesPath));

            const copiedCategories = [];

            // Check if we have categories to copy
            if (prevCategoriesSnapshot.empty) {
                // console.log(`No categories found in previous month ${mostRecentMonth}`);
                return [];
            }

            // Create the same categories with the same goals but zero totals
            for (const categoryDoc of prevCategoriesSnapshot.docs) {
                const categoryName = categoryDoc.id;
                const categoryData = categoryDoc.data() || {};

                copiedCategories.push(categoryName);

                // Ensure we have a valid goal value
                const goalValue = typeof categoryData.goal === 'number' ? categoryData.goal : 0;
                const colorValue = categoryData.color || '#1976d2'; // Default color if missing

                // Create the category document in the new month
                await setDoc(doc(db, `manualBudget/${userId}/months/${newMonth}/categories/${categoryName}`), {
                    goal: goalValue,
                    total: 0, // Reset total for the new month
                    createdAt: new Date(),
                    color: colorValue
                });
                // console.log(`Copied category ${categoryName} to ${newMonth}`);
            }

            // console.log(`Finished copying ${copiedCategories.length} categories to ${newMonth}`);
            return copiedCategories; // Return the list of copied category names

        } catch (error) {
            console.error(`Error creating month ${newMonth} from previous for user ${userId}:`, error);
            return []; // Return empty array on error
        }
    }, [db]); // Depend only on db, userId is passed in

    // Fetch categories for a given month
    const fetchCategories = useCallback(async (userId, month) => {
        if (!userId || !month || !db) { // Check passed userId
            setCategories([]);
            return [];
        }

        try {
            // console.log(`Fetching categories for month: ${month} for user ${userId}`);
            const categoriesPath = `manualBudget/${userId}/months/${month}/categories`; // Use passed userId
            const categoriesSnapshot = await getDocs(collection(db, categoriesPath));
            const categoriesList = categoriesSnapshot.docs.map(doc => doc.id);
            // console.log(`Found ${categoriesList.length} categories for month ${month} for user ${userId}`);
            setCategories(categoriesList);
            return categoriesList;
        } catch (error) {
            console.error(`Error fetching categories for user ${userId}, month ${month}:`, error);
            setCategories([]);
            return [];
        }
    }, [db]); // Depend only on db, userId is passed in

    // Effect to handle initial data load and user changes
    useEffect(() => {
        // console.log(`[processUser Effect Trigger] authLoading: ${authLoading}, activeUser?.uid: ${activeUser?.uid}`); // Log on trigger

        // Don't run if auth is still loading
        if (authLoading) {
            setDataLoading(true);
            // console.log('[processUser] Skipping: Auth is loading.');
            return;
        }

        // Introduce a small delay to allow Firestore rules to potentially propagate
        const timerId = setTimeout(() => {
            setDataLoading(true);
            const processUser = async () => {
                // Capture user and db instance at the start of this specific execution
                const currentUser = activeUser; // Capture from context *inside* timeout
                const currentDb = db;

                // Log the user ID *just before* attempting Firestore operations
                // console.log(`[processUser Timeout Start] currentUser?.uid: ${currentUser?.uid}`);

                if (currentUser && currentDb) {
                    const userIdForProcess = currentUser.uid; // Capture user ID for logging
                    // console.log(`[processUser] Running for user: ${userIdForProcess} (after delay)`);
                    try {
                        // ... existing try block logic ...
                        // console.log(`[processUser] Attempting getDoc for userDocRef: manualBudget/${userIdForProcess}`);
                        const userDocRef = doc(currentDb, 'manualBudget', userIdForProcess);
                        const userDocSnap = await getDoc(userDocRef);
                        // ... rest of try block ...
                        if (userDocSnap.exists()) {
                            setName(userDocSnap.data().name || '');
                            setNeedsNamePrompt(!userDocSnap.data().name);
                            // console.log(`[processUser] Found user doc for ${userIdForProcess}. Name: ${userDocSnap.data().name || 'N/A'}`);
                        } else {
                            // User document doesn't exist, need to prompt for name
                            // console.log(`[processUser] ManualBudget document for ${userIdForProcess} does not exist.`);
                            setName('');
                            setNeedsNamePrompt(true);
                        }

                        // Determine and set the current month
                        const calendarMonth = getCurrentMonth();
                        // console.log(`[processUser] Checking month ${calendarMonth} for user ${userIdForProcess}`);
                        const calendarMonthDocRef = doc(currentDb, `manualBudget/${userIdForProcess}/months/${calendarMonth}`);
                        const calendarMonthDocSnap = await getDoc(calendarMonthDocRef);

                        let monthToLoad = calendarMonth;

                        // If current calendar month doesn't exist, create it from previous
                        if (!calendarMonthDocSnap.exists()) {
                            // console.log(`[processUser] Month ${calendarMonth} does not exist for user ${userIdForProcess}. Attempting to create from previous.`);
                            await createMonthFromPrevious(userIdForProcess, calendarMonth); // Pass userIdForProcess explicitly
                            // If creation was successful, monthToLoad remains calendarMonth
                            // console.log(`[processUser] Month ${calendarMonth} created/checked for user ${userIdForProcess}.`);
                        } else {
                             // console.log(`[processUser] Month ${calendarMonth} exists for user ${userIdForProcess}. Checking categories.`);
                             // Check if the existing month has categories, if not, try to fix it
                            const categoriesPath = `manualBudget/${userIdForProcess}/months/${calendarMonth}/categories`;
                            const categoriesSnapshot = await getDocs(collection(currentDb, categoriesPath));
                            if (categoriesSnapshot.empty) {
                                console.warn(`[processUser] Month ${calendarMonth} exists but has no categories for user ${userIdForProcess}. Fix will be attempted by checkAndFixCurrentMonth effect.`);
                                // Logic moved to checkAndFixCurrentMonth effect
                            } else {
                                // console.log(`[processUser] Found ${categoriesSnapshot.size} categories in ${calendarMonth} for user ${userIdForProcess}.`);
                            }
                        }

                        setCurrentMonthState(monthToLoad);
                        // console.log(`[processUser] Setting current month to ${monthToLoad} for user ${userIdForProcess}. Fetching categories.`);
                        await fetchCategories(userIdForProcess, monthToLoad); // Pass userIdForProcess explicitly

                    } catch (error) {
                        // Add specific logging for permission errors
                        if (error.code === 'permission-denied') {
                             console.error(`[processUser] Firestore Permission Error for user ${userIdForProcess} (captured):`, error.message);
                        } else {
                            console.error(`[processUser] Error getting user data or month for user ${userIdForProcess} (captured):`, error);
                        }
                        // Reset state on error to avoid inconsistent UI
                        setName('');
                        setCategories([]);
                        setCurrentMonthState(getCurrentMonth()); // Fallback to current calendar month
                        setNeedsNamePrompt(false); // Avoid prompt loop on error
                    } finally {
                        // console.log(`[processUser] Finished processing for user ${userIdForProcess}. Setting dataLoading to false.`);
                        setDataLoading(false);
                    }
                } else {
                    // No active user
                    // console.log('[processUser] No active user. Resetting state.');
                    setName('');
                    setCategories([]);
                    setCurrentMonthState(getCurrentMonth()); // Reset month
                    setNeedsNamePrompt(false);
                    setDataLoading(false);
                }
            };

            processUser();
        }, 500); // Increased delay to 500ms

        // Cleanup function to clear the timeout if dependencies change or component unmounts
        return () => {
            // console.log('[processUser Effect Cleanup] Clearing timeout.');
            clearTimeout(timerId);
        }

    }, [activeUser, db, authLoading, getCurrentMonth, createMonthFromPrevious, fetchCategories]); // Add authLoading and other dependencies

    // Function to update local categories state (e.g., after adding/removing)
    const updateCategories = useCallback((newCategories) => {
        setCategories(newCategories);
    }, []);

    // Function to create the initial user document in 'manualBudget' collection
    const createUserDocument = useCallback(async (userId, userName) => { // Receive userId explicitly
        if (!userId || !db) return;

        try {
            await setDoc(doc(db, 'manualBudget', userId), { // Use passed userId
                name: userName
            });

            // Also initialize the current month document
            const thisMonth = getCurrentMonth();
            await setDoc(doc(db, `manualBudget/${userId}/months/${thisMonth}`), { // Use passed userId
                total: 0,
                createdAt: new Date()
            }, { merge: true });

            setName(userName);
            setNeedsNamePrompt(false);

            // Set current month and fetch categories
            setCurrentMonthState(thisMonth);
            fetchCategories(userId, thisMonth); // Pass userId explicitly
        } catch (error) {
            console.error(`Error creating user document for user ${userId}:`, error);
            // Potentially re-throw or handle error state
        }
    }, [db, getCurrentMonth, fetchCategories]); // fetchCategories depends on activeUser/db

    // Function to set the current month state locally
    const setCurrentMonth = useCallback(async (month) => {
        // Check activeUser *here* before fetching
        if (!activeUser) {
            console.warn("[setCurrentMonth] No active user, cannot fetch categories.");
            setCurrentMonthState(month);
            setCategories([]); // Clear categories if no user
            return;
        }
        setCurrentMonthState(month);
        // Pass activeUser.uid explicitly
        await fetchCategories(activeUser.uid, month);
    }, [activeUser, fetchCategories]); // Add activeUser dependency

    // Function to add a new month document (called from MonthSelectorModal)
    const addNewMonth = useCallback(async (newMonth) => {
        if (!activeUser || !db) return false; // Use activeUser

        try {
            // Check if month already exists
            const monthDocRef = doc(db, `manualBudget/${activeUser.uid}/months/${newMonth}`); // Use activeUser.uid
            const monthDoc = await getDoc(monthDocRef);

            if (!monthDoc.exists()) {
                // console.log(`Creating new month: ${newMonth}`);
                // Create new month based on previous month
                const newCategories = await createMonthFromPrevious(activeUser.uid, newMonth); // Pass activeUser.uid explicitly

                // Update state only after successful creation
                setCurrentMonthState(newMonth);
                setCategories(newCategories); // Set the categories copied/created

                return true;
            } else {
                // console.log(`Month ${newMonth} already exists`);
                // Even if the month already exists, set it as the current month and fetch its categories
                setCurrentMonthState(newMonth);
                await fetchCategories(activeUser.uid, newMonth); // Pass activeUser.uid explicitly
                return true; // Indicate success (month is now active)
            }
        } catch (error) {
            console.error(`Error adding new month ${newMonth} for user ${activeUser.uid}:`, error);
            return false;
        }
    }, [activeUser, db, createMonthFromPrevious, fetchCategories]); // Add dependencies

    // Effect to check and fix months without categories
    useEffect(() => {
        let timerId; // Declare timerId for cleanup

        // Log state when this effect triggers
        // console.log(`[checkAndFix Effect Trigger] loading: ${loading}, activeUser?.uid: ${activeUser?.uid}, currentMonth: ${currentMonth}, db: ${!!db}`);

        const checkAndFixCurrentMonth = async () => {
            // Capture state *inside* the async function after the delay
            const userForCheck = activeUser;
            const monthForCheck = currentMonth;
            const dbForCheck = db;

            // Log the user ID *just before* attempting Firestore operations
            // console.log(`[checkAndFix Timeout Start] userForCheck?.uid: ${userForCheck?.uid}, monthForCheck: ${monthForCheck}`);

            // Check conditions again *inside* the timeout callback
            if (loading || !userForCheck || !monthForCheck || !dbForCheck) {
                 // console.log(`[checkAndFix Timeout] Skipping check inside async. State: loading=${loading}, userForCheck=${!!userForCheck}, monthForCheck=${monthForCheck}, dbForCheck=${!!dbForCheck}`);
                 return;
            }

            const userIdForCheck = userForCheck.uid; // Use captured user ID

            // console.log(`[checkAndFixCurrentMonth] Running for user: ${userIdForCheck}, month: ${monthForCheck} (after delay)`);

            try {
                // ... existing try block logic ...
                // console.log(`[checkAndFixCurrentMonth] Attempting getDocs for categoriesPath: manualBudget/${userIdForCheck}/months/${monthForCheck}/categories`);
                const categoriesPath = `manualBudget/${userIdForCheck}/months/${monthForCheck}/categories`;
                const categoriesSnapshot = await getDocs(collection(dbForCheck, categoriesPath));
                // ... rest of try block ...
                if (categoriesSnapshot.empty) {
                    console.warn(`[checkAndFixCurrentMonth] Detected empty categories for ${currentMonth}. Attempting fix for user ${userIdForCheck}.`);

                    // Get all existing months for the user
                    const monthsCollection = collection(db, `manualBudget/${userIdForCheck}/months`);
                    const monthsSnapshot = await getDocs(monthsCollection);
                    const monthsList = monthsSnapshot.docs.map(doc => doc.id).sort((a, b) => b.localeCompare(a));

                    // Find the most recent *other* month with categories
                    const otherMonths = monthsList.filter(month => month !== currentMonth);
                    let sourceMonth = null;
                    for (const month of otherMonths) {
                        const monthCategoriesPath = `manualBudget/${userIdForCheck}/months/${month}/categories`;
                        const monthCategoriesSnapshot = await getDocs(collection(db, monthCategoriesPath));
                        if (!monthCategoriesSnapshot.empty) {
                            sourceMonth = month;
                            break; // Found a source month
                        }
                    }

                    if (sourceMonth) {
                        // console.log(`[checkAndFixCurrentMonth] Found source month ${sourceMonth} with categories to copy from for user ${userIdForCheck}.`);
                        // Copy categories from sourceMonth to currentMonth
                        const sourceCategoriesPath = `manualBudget/${userIdForCheck}/months/${sourceMonth}/categories`;
                        const sourceCategoriesSnapshot = await getDocs(collection(db, sourceCategoriesPath));

                        let copiedCount = 0;
                        for (const categoryDoc of sourceCategoriesSnapshot.docs) {
                            const categoryName = categoryDoc.id;
                            const categoryData = categoryDoc.data() || {};
                            const goalValue = typeof categoryData.goal === 'number' ? categoryData.goal : 0;
                            const colorValue = categoryData.color || '#1976d2';

                            // Set doc in the *current* month's categories
                            await setDoc(doc(db, `manualBudget/${userIdForCheck}/months/${currentMonth}/categories/${categoryName}`), {
                                goal: goalValue,
                                total: 0, // Reset total
                                createdAt: new Date(),
                                color: colorValue
                            });
                            copiedCount++;
                            // console.log(`[checkAndFixCurrentMonth] Fixed: Copied category ${categoryName} from ${sourceMonth} to ${currentMonth} for user ${userIdForCheck}`);
                        }

                        if (copiedCount > 0) {
                            // Refresh categories state after fixing
                            await fetchCategories(userIdForCheck, currentMonth); // Pass userIdForCheck explicitly
                        } else {
                             console.warn(`[checkAndFixCurrentMonth] Source month ${sourceMonth} had no categories to copy for user ${userIdForCheck}.`);
                        }
                    } else {
                        console.warn(`[checkAndFixCurrentMonth] Could not find any previous month with categories to fix ${currentMonth} for user ${userIdForCheck}. Month remains empty.`);
                        // Ensure local state reflects empty categories
                        setCategories([]);
                    }
                } else {
                    // console.log(`[checkAndFixCurrentMonth] Categories found for ${currentMonth}, user ${userIdForCheck}. No fix needed.`);
                }
            } catch (error) {
                // Add specific logging for permission errors
                if (error.code === 'permission-denied') {
                    console.error(`[checkAndFixCurrentMonth] Firestore Permission Error for user ${userIdForCheck} (captured), month ${monthForCheck}:`, error.message);
                } else {
                    console.error(`[checkAndFixCurrentMonth] Error checking/fixing current month for user ${userIdForCheck} (captured), month ${monthForCheck}:`, error);
                }
                // Optionally reset state or indicate an error state here if needed
                // setCategories([]); // Example: Reset categories on error
            }
        };

        // Run the check after initial loading is done and user/month are stable
        if (!loading && activeUser && currentMonth && db) {
             // console.log(`[checkAndFix Effect] Conditions met. Setting timeout for user ${activeUser.uid}, month ${currentMonth}.`);
             timerId = setTimeout(checkAndFixCurrentMonth, 500); // Keep delay
        } else {
            // console.log(`[checkAndFix Effect] Skipping check. State: loading=${loading}, activeUser=${!!activeUser}, currentMonth=${currentMonth}, db=${!!db}`);
        }

        // Cleanup function to clear the timeout
        return () => {
            // console.log('[checkAndFix Effect Cleanup] Clearing timeout.');
            clearTimeout(timerId);
        }

    }, [activeUser, currentMonth, db, loading, fetchCategories]); // Add loading, db, fetchCategories


    return {
        // user, // Remove: Consuming components get activeUser from useAuth()
        loading, // Return combined loading state
        name,
        categories,
        currentMonth,
        // db, // Remove: Consuming components get db from useAuth()
        updateCategories, // Keep: Function to update local state
        needsNamePrompt,
        createUserDocument, // Keep: Action function
        setCurrentMonth, // Keep: Action function
        addNewMonth // Keep: Action function
    };
}
