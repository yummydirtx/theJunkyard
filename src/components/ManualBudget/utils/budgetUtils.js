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

import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';

/**
 * Format a number as currency
 * @param {number} value - The number to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

/**
 * Format a date string for display
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

/**
 * Format a month string from YYYY-MM to Month YYYY
 * @param {string} monthStr - The month string in YYYY-MM format
 * @returns {string} Formatted month string
 */
export const formatMonth = (monthStr) => {
    try {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch (e) {
        return monthStr;
    }
};

/**
 * Get current month in YYYY-MM format
 * @returns {string} Current month in YYYY-MM format
 */
export const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Parse amount string to number with 2 decimal places
 * @param {string} amount - Amount string
 * @returns {number} Parsed amount
 */
export const parseAmount = (amount) => {
    return amount ? Math.round(parseFloat(amount) * 100) / 100 : 0;
};

/**
 * Check if a string is a valid month format (YYYY-MM)
 * @param {string} month - Month string to validate
 * @returns {boolean} True if valid
 */
export const isValidMonth = (month) => {
    return month && /^\d{4}-\d{2}$/.test(month);
};

/**
 * Update category in Firestore
 * @param {Object} db - Firestore database reference
 * @param {string} userId - User ID 
 * @param {string} monthId - Month ID in YYYY-MM format
 * @param {string} categoryName - Category name
 * @param {Object} data - Category data to update
 */
export const updateCategory = async (db, userId, monthId, categoryName, data) => {
    const categoryPath = `manualBudget/${userId}/months/${monthId}/categories/${categoryName}`;
    await updateDoc(doc(db, categoryPath), data);
};

/**
 * Get category data from Firestore
 * @param {Object} db - Firestore database reference 
 * @param {string} userId - User ID
 * @param {string} monthId - Month ID in YYYY-MM format
 * @param {string} categoryName - Category name
 * @returns {Object} Category data
 */
export const getCategoryData = async (db, userId, monthId, categoryName) => {
    const categoryPath = `manualBudget/${userId}/months/${monthId}/categories/${categoryName}`;
    const categoryDoc = await getDoc(doc(db, categoryPath));
    
    if (categoryDoc.exists()) {
        return categoryDoc.data();
    }
    
    return null;
};

/**
 * Update month totals in Firestore
 * @param {Object} db - Firestore database reference
 * @param {string} userId - User ID
 * @param {string} monthId - Month ID in YYYY-MM format
 * @param {Object} data - Month data to update
 */
export const updateMonth = async (db, userId, monthId, data) => {
    const monthPath = `manualBudget/${userId}/months/${monthId}`;
    await updateDoc(doc(db, monthPath), data);
};

/**
 * Get month data from Firestore
 * @param {Object} db - Firestore database reference
 * @param {string} userId - User ID
 * @param {string} monthId - Month ID in YYYY-MM format
 * @returns {Object} Month data
 */
export const getMonthData = async (db, userId, monthId) => {
    const monthPath = `manualBudget/${userId}/months/${monthId}`;
    const monthDoc = await getDoc(doc(db, monthPath));
    
    if (monthDoc.exists()) {
        return monthDoc.data();
    }
    
    return null;
};
