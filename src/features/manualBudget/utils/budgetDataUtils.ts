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

import { doc, getDoc, updateDoc, Firestore, DocumentData } from 'firebase/firestore';

/**
 * Budget-specific utilities for Firestore operations and manual budget logic
 * These functions are specific to the manual budget feature
 */

/**
 * Category data interface for type safety
 */
export interface CategoryData {
    goal?: number;
    total?: number;
    color?: string;
    createdAt?: any;
    [key: string]: any;
}

/**
 * Month data interface for type safety
 */
export interface MonthData {
    total?: number;
    goal?: number;
    createdAt?: any;
    [key: string]: any;
}

/**
 * Update category in Firestore
 * @param db - Firestore database reference
 * @param userId - User ID 
 * @param monthId - Month ID in YYYY-MM format
 * @param categoryName - Category name
 * @param data - Category data to update
 */
export const updateCategory = async (
    db: Firestore, 
    userId: string, 
    monthId: string, 
    categoryName: string, 
    data: Partial<CategoryData>
): Promise<void> => {
    const categoryPath = `manualBudget/${userId}/months/${monthId}/categories/${categoryName}`;
    await updateDoc(doc(db, categoryPath), data);
};

/**
 * Get category data from Firestore
 * @param db - Firestore database reference 
 * @param userId - User ID
 * @param monthId - Month ID in YYYY-MM format
 * @param categoryName - Category name
 * @returns Category data
 */
export const getCategoryData = async (
    db: Firestore, 
    userId: string, 
    monthId: string, 
    categoryName: string
): Promise<CategoryData | null> => {
    const categoryPath = `manualBudget/${userId}/months/${monthId}/categories/${categoryName}`;
    const categoryDoc = await getDoc(doc(db, categoryPath));
    
    if (categoryDoc.exists()) {
        return categoryDoc.data() as CategoryData;
    }
    
    return null;
};

/**
 * Update month totals in Firestore
 * @param db - Firestore database reference
 * @param userId - User ID
 * @param monthId - Month ID in YYYY-MM format
 * @param data - Month data to update
 */
export const updateMonth = async (
    db: Firestore, 
    userId: string, 
    monthId: string, 
    data: Partial<MonthData>
): Promise<void> => {
    const monthPath = `manualBudget/${userId}/months/${monthId}`;
    await updateDoc(doc(db, monthPath), data);
};

/**
 * Get month data from Firestore
 * @param db - Firestore database reference
 * @param userId - User ID
 * @param monthId - Month ID in YYYY-MM format
 * @returns Month data
 */
export const getMonthData = async (
    db: Firestore, 
    userId: string, 
    monthId: string
): Promise<MonthData | null> => {
    const monthPath = `manualBudget/${userId}/months/${monthId}`;
    const monthDoc = await getDoc(doc(db, monthPath));
    
    if (monthDoc.exists()) {
        return monthDoc.data() as MonthData;
    }
    
    return null;
};
