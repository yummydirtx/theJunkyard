// Copyright (c) 2025 Alex Frutkin
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the Software), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

import { doc, getDoc, getDocs, collection, query, orderBy } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { BudgetCategory } from '../types';

/**
 * Interface for raw entry data from Firestore
 */
interface EntryData {
  id: string;
  amount: number;
  date: string;
  description?: string;
  type: 'income' | 'expense';
  userId: string;
  createdAt: any;
  updatedAt: any;
}

interface UserData {
  name: string;
  createdAt: any;
  updatedAt: any;
}

interface MonthData {
  categories: BudgetCategory[];
  createdAt: any;
  updatedAt: any;
}

/**
 * Query functions for manual budget data
 * These functions are used by TanStack Query to fetch data
 */

export const queryFunctions = {
  /**
   * Fetch user data (name, etc.)
   */
  fetchUserData: async (db: Firestore, userId: string): Promise<UserData | null> => {
    if (!userId || !db) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'manualBudget', userId));
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },

  /**
   * Fetch categories for a specific month
   */
  fetchCategories: async (db: Firestore, userId: string, month: string): Promise<BudgetCategory[]> => {
    if (!userId || !month || !db) return [];

    try {
      const categoriesPath = `manualBudget/${userId}/months/${month}/categories`;
      const snapshot = await getDocs(collection(db, categoriesPath));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: doc.id,
          budget: data.goal || 0, // Map Firestore "goal" to BudgetCategory "budget"
          color: data.color || '#9c27b0',
          total: data.total || 0,
        } as BudgetCategory;
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Fetch all entries for a specific month across all categories
   */
  fetchEntries: async (db: Firestore, userId: string, month: string): Promise<BudgetEntry[]> => {
    if (!userId || !month || !db) return [];
    
    try {
      // First get all categories for this month
      const categoriesPath = `manualBudget/${userId}/months/${month}/categories`;
      const categoriesSnapshot = await getDocs(collection(db, categoriesPath));
      
      // Get entries from each category
      const allEntries: BudgetEntry[] = [];
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryName = categoryDoc.id;
        const entriesPath = `manualBudget/${userId}/months/${month}/categories/${categoryName}/entries`;
        const q = query(collection(db, entriesPath), orderBy('date', 'desc'));
        const entriesSnapshot = await getDocs(q);
        
        const categoryEntries = entriesSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          category: categoryName, // Add category info to each entry
          ...doc.data() 
        } as BudgetEntry));
        
        allEntries.push(...categoryEntries);
      }
      
      // Sort all entries by date (most recent first)
      return allEntries.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date as string);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date as string);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error fetching entries:', error);
      throw error;
    }
  },

  /**
   * Fetch recurring expense definitions
   */
  fetchRecurringExpenses: async (db: Firestore, userId: string): Promise<RecurringExpenseDefinition[]> => {
    if (!userId || !db) return [];
    
    try {
      const path = `manualBudget/${userId}/recurringExpenses`;
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecurringExpenseDefinition));
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
      throw error;
    }
  },

  /**
   * Fetch month summary data including categories and entries
   */
  fetchMonthSummary: async (db: Firestore, userId: string, month: string): Promise<MonthSummary> => {
    // Alias for fetchMonthData to maintain compatibility
    return queryFunctions.fetchMonthData(db, userId, month);
  },

  /**
   * Fetch month summary data including categories and entries
   */
  fetchMonthData: async (db: Firestore, userId: string, month: string): Promise<MonthSummary> => {
    if (!userId || !month || !db) {
      return { 
        categories: [], 
        entries: [], 
        totalBudget: 0, 
        totalSpent: 0, 
        totalIncome: 0, 
        totalRemaining: 0,
        remainingBudget: 0 
      };
    }
    
    try {
      const [categories, entries] = await Promise.all([
        queryFunctions.fetchCategories(db, userId, month),
        queryFunctions.fetchEntries(db, userId, month),
      ]);

      const totalBudget = categories.reduce((sum, cat) => sum + (cat.budget || 0), 0);
      const totalSpent = entries.reduce((sum, entry) => {
        return entry.type === 'expense' ? sum + Math.abs(entry.amount) : sum;
      }, 0);
      const totalIncome = entries.reduce((sum, entry) => {
        return entry.type === 'income' ? sum + Math.abs(entry.amount) : sum;
      }, 0);
      const totalRemaining = totalBudget - totalSpent;

      return {
        categories,
        entries,
        totalBudget,
        totalSpent,
        totalIncome,
        totalRemaining,
        remainingBudget: totalRemaining, // Alias for compatibility
      };
    } catch (error) {
      console.error('Error fetching month data:', error);
      throw error;
    }
  }
};

/**
 * Additional type definitions
 */
export interface BudgetEntry {
  id: string;
  amount: number;
  date: Date | string;
  description?: string;
  category: string;
  type?: 'income' | 'expense';
  userId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface RecurringExpenseDefinition {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  dayOfMonth?: number; // For monthly expenses
  dayOfWeek?: number; // For weekly expenses
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface MonthSummary {
  categories: BudgetCategory[];
  entries: BudgetEntry[];
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  totalRemaining: number;
  remainingBudget: number;
}
