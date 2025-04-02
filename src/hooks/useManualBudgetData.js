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

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocs, collection, setDoc } from 'firebase/firestore';

/**
 * Custom hook for managing authentication and data fetching in ManualBudget
 * @param {Object} app - Firebase app instance
 * @returns {Object} - Object containing user data, authentication state, and categories
 */
export default function useManualBudgetData(app) {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const [user, setUser] = useState(auth.currentUser);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [currentMonth, setCurrentMonthState] = useState('');
    const [needsNamePrompt, setNeedsNamePrompt] = useState(false);

    // Get current month in YYYY-MM format
    const getCurrentMonth = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    };

    // Create a new month by copying categories and goals from the most recent previous month
    const createMonthFromPrevious = async (newMonth) => {
        if (!user) return [];

        try {
            console.log(`Creating new month ${newMonth} based on previous month data`);
            
            // Get all existing months
            const monthsCollection = collection(db, `manualBudget/${user.uid}/months`);
            const monthsSnapshot = await getDocs(monthsCollection);
            const monthsList = monthsSnapshot.docs.map(doc => doc.id);
            
            // Sort months in descending order (newest first)
            monthsList.sort((a, b) => b.localeCompare(a));
            
            // Filter out the current month (which doesn't exist yet)
            const previousMonths = monthsList.filter(month => month !== newMonth);
            
            if (previousMonths.length === 0) {
                // No previous months, create empty month
                await setDoc(doc(db, `manualBudget/${user.uid}/months/${newMonth}`), {
                    total: 0,
                    createdAt: new Date()
                });
                return [];
            }
            
            // Get most recent month
            const mostRecentMonth = previousMonths[0];
            console.log(`Using ${mostRecentMonth} as template for new month ${newMonth}`);
            
            // Create the new month document
            await setDoc(doc(db, `manualBudget/${user.uid}/months/${newMonth}`), {
                total: 0, // Start with zero total
                createdAt: new Date()
            });
            
            // Copy categories and goals from previous month
            const prevCategoriesPath = `manualBudget/${user.uid}/months/${mostRecentMonth}/categories`;
            const prevCategoriesSnapshot = await getDocs(collection(db, prevCategoriesPath));
            
            const copiedCategories = [];
            
            // Check if we have categories to copy
            if (prevCategoriesSnapshot.empty) {
                console.log(`No categories found in previous month ${mostRecentMonth}`);
                return [];
            }
            
            // Create the same categories with the same goals but zero totals
            for (const categoryDoc of prevCategoriesSnapshot.docs) {
                const categoryName = categoryDoc.id;
                const categoryData = categoryDoc.data() || {};
                
                copiedCategories.push(categoryName);
                
                // Ensure we have a valid goal value
                const goalValue = typeof categoryData.goal === 'number' ? categoryData.goal : 0;
                
                await setDoc(doc(db, `manualBudget/${user.uid}/months/${newMonth}/categories/${categoryName}`), {
                    goal: goalValue,
                    total: 0, // Start with zero total
                    createdAt: new Date(),
                    color: categoryData.color || '#1976d2' // Copy color or use default blue
                });
                
                console.log(`Copied category ${categoryName} with goal ${goalValue} and color ${categoryData.color || '#1976d2'}`);
            }
            
            console.log(`Created ${copiedCategories.length} categories in new month ${newMonth}`);
            return copiedCategories;
        } catch (error) {
            console.error('Error creating month from previous:', error);
            return [];
        }
    };

    useEffect(() => {
        // Initialize current month state
        const thisMonth = getCurrentMonth();
        setCurrentMonthState(thisMonth);

        const authChange = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                console.log('User is signed in:', currentUser.uid);
                // User is signed in, get their name from Firestore
                try {
                    var userDoc = await getDoc(doc(db, 'manualBudget', currentUser.uid));
                    if (userDoc.exists()) {
                        setName(userDoc.data().name);
                        setNeedsNamePrompt(false);
                    } else {
                        // User document doesn't exist, need to prompt for name
                        setNeedsNamePrompt(true);
                    }

                    // Always use the current calendar month
                    const calendarMonth = getCurrentMonth();
                    const calendarMonthDocRef = doc(db, `manualBudget/${currentUser.uid}/months/${calendarMonth}`);
                    const calendarMonthDoc = await getDoc(calendarMonthDocRef);
                    
                    // If current calendar month doesn't exist yet, create it from previous month
                    if (!calendarMonthDoc.exists()) {
                        await createMonthFromPrevious(calendarMonth);
                    }

                    // Set current month to the current calendar month
                    setCurrentMonthState(calendarMonth);
                    
                    // Fetch categories
                    await fetchCategories(calendarMonth);

                } catch (error) {
                    console.error('Error getting user data:', error);
                }
                setLoading(false);
            } else {
                setLoading(false);
            }
        });
        
        // Clean up the subscription on unmount
        return authChange;
    }, [auth, db]);

    const fetchCategories = async (month) => {
        if (!user || !month) return;

        try {
            console.log(`Fetching categories for month: ${month}`);
            const categoriesPath = `manualBudget/${user.uid}/months/${month}/categories`;
            const categoriesSnapshot = await getDocs(collection(db, categoriesPath));
            const categoriesList = categoriesSnapshot.docs.map(doc => doc.id);
            console.log(`Found ${categoriesList.length} categories for month ${month}`);
            setCategories(categoriesList);
            return categoriesList;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    };

    // Force refresh categories on mount or when user/month changes
    useEffect(() => {
        if (user && currentMonth) {
            fetchCategories(currentMonth);
        }
    }, [user, currentMonth]);

    const updateCategories = (newCategories) => {
        setCategories(newCategories);
    };

    const createUserDocument = async (userName) => {
        if (!user) return;
        
        try {
            await setDoc(doc(db, 'manualBudget', user.uid), {
                name: userName
            });
            
            // Also initialize the current month document
            const thisMonth = getCurrentMonth();
            await setDoc(doc(db, `manualBudget/${user.uid}/months/${thisMonth}`), {
                total: 0,
                createdAt: new Date()
            }, { merge: true });
            
            setName(userName);
            setNeedsNamePrompt(false);
            
            // Set current month and fetch categories
            setCurrentMonthState(thisMonth);
            fetchCategories(thisMonth);
        } catch (error) {
            console.error('Error creating user document:', error);
        }
    };

    const setCurrentMonth = async (month) => {
        // Just update the current month state - no Firestore persistence
        setCurrentMonthState(month);
        
        // Reload categories for the selected month
        fetchCategories(month);
    };

    // When adding a new month from the Month Selector modal
    const addNewMonth = async (newMonth) => {
        if (!user) return false;
        
        try {
            // Check if month already exists
            const monthDocRef = doc(db, `manualBudget/${user.uid}/months/${newMonth}`);
            const monthDoc = await getDoc(monthDocRef);
            
            if (!monthDoc.exists()) {
                console.log(`Creating new month: ${newMonth}`);
                
                // Create new month based on previous month
                const categories = await createMonthFromPrevious(newMonth);
                
                // Update state
                setCurrentMonthState(newMonth);
                setCategories(categories);
                
                return true;
            } else {
                console.log(`Month ${newMonth} already exists`);
                
                // Even if the month already exists, we should still set it as the current month
                setCurrentMonth(newMonth);
                return true;
            }
        } catch (error) {
            console.error('Error adding new month:', error);
            return false;
        }
    };

    // Improved function to ensure months without categories get fixed
    useEffect(() => {
        const checkAndFixCurrentMonth = async () => {
            if (!user || !currentMonth) return;
            
            try {
                // Check if the current month has any categories
                const categoriesPath = `manualBudget/${user.uid}/months/${currentMonth}/categories`;
                const categoriesSnapshot = await getDocs(collection(db, categoriesPath));
                
                if (categoriesSnapshot.empty) {
                    console.log(`Current month ${currentMonth} has no categories, attempting to fix...`);
                    
                    // Get all months
                    const monthsCollection = collection(db, `manualBudget/${user.uid}/months`);
                    const monthsSnapshot = await getDocs(monthsCollection);
                    const monthsList = monthsSnapshot.docs.map(doc => doc.id);
                    
                    // Sort and find other months with categories
                    monthsList.sort((a, b) => b.localeCompare(a));
                    
                    // Remove current month from the list
                    const otherMonths = monthsList.filter(month => month !== currentMonth);
                    
                    // Look for a month with categories
                    for (const month of otherMonths) {
                        const monthCategoriesPath = `manualBudget/${user.uid}/months/${month}/categories`;
                        const monthCategoriesSnapshot = await getDocs(collection(db, monthCategoriesPath));
                        
                        if (!monthCategoriesSnapshot.empty) {
                            console.log(`Found month ${month} with categories to copy from`);
                            // Copy total and goal from this month
                            const donorMonth = doc(db, `manualBudget/${user.uid}/months/${month}`);
                            const monthDoc = await getDoc(donorMonth);
                            const monthData = monthDoc.data();
                            const newGoal = monthData.goal || 0;

                            const currentMonthRef = doc(db, `manualBudget/${user.uid}/months/${currentMonth}`);

                            await setDoc(currentMonthRef, {
                                total: 0,
                                goal: newGoal
                            }, { merge: true });

                            // Copy categories from this month
                            for (const categoryDoc of monthCategoriesSnapshot.docs) {
                                const categoryName = categoryDoc.id;
                                const categoryData = categoryDoc.data() || {};

                                // Ensure we have a valid goal value
                                const goalValue = typeof categoryData.goal === 'number' ? categoryData.goal : 0;

                                await setDoc(doc(db, `manualBudget/${user.uid}/months/${currentMonth}/categories/${categoryName}`), {
                                    goal: goalValue,
                                    total: 0,
                                    createdAt: new Date(),
                                    color: categoryData.color || '#1976d2' // Copy color or use default blue
                                });

                                console.log(`Fixed: Copied category ${categoryName} to current month`);
                            }

                            // Refresh categories
                            fetchCategories(currentMonth);
                            return;
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking/fixing current month:', error);
            }
        };
        
        checkAndFixCurrentMonth();
    }, [user, currentMonth]);

    return {
        user,
        loading,
        name,
        categories,
        currentMonth,
        db,
        updateCategories,
        needsNamePrompt,
        createUserDocument,
        setCurrentMonth,
        addNewMonth
    };
}
