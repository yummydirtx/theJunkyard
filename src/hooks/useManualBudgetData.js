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
import { getFirestore, doc, getDoc, getDocs, collection } from 'firebase/firestore';

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
    const [currentMonth, setCurrentMonth] = useState('');

    useEffect(() => {
        const authChange = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // User is signed in, get their name from Firestore
                try {
                    var userDoc = await getDoc(doc(db, 'manualBudget', currentUser.uid));
                    if (userDoc.exists()) {
                        setName(userDoc.data().name);
                    }

                    // Calculate current month in YYYY-MM format
                    const today = new Date();
                    const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
                    setCurrentMonth(thisMonth);
                    
                    // Fetch categories from the current month
                    const categoriesPath = `manualBudget/${currentUser.uid}/months/${thisMonth}/categories`;
                    const categoriesSnapshot = await getDocs(collection(db, categoriesPath));
                    const categoriesList = categoriesSnapshot.docs.map(doc => doc.id);
                    setCategories(categoriesList);
                } catch (error) {
                    console.error('Error getting user data:', error);
                }
            }
            setLoading(false);
        });
        
        // Clean up the subscription on unmount
        return authChange;
    }, [auth, db]);

    const updateCategories = (newCategories) => {
        setCategories(newCategories);
    };

    return {
        user,
        loading,
        name,
        categories,
        currentMonth,
        db,
        updateCategories
    };
}
