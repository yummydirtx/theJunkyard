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

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Firestore,
  User
} from 'firebase/firestore';
import { BudgetCategory, BudgetEntry, RecurringExpense, BudgetData } from '../types';

export class ManualBudgetService {
  constructor(private db: Firestore) {}

  /**
   * Get all budget categories for a user
   */
  async getCategories(user: User): Promise<BudgetCategory[]> {
    const categoriesRef = collection(this.db, 'users', user.uid, 'budgetCategories');
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({ ...doc.data() } as BudgetCategory));
  }

  /**
   * Add a new budget category
   */
  async addCategory(user: User, category: Omit<BudgetCategory, 'spent'>): Promise<void> {
    const categoriesRef = collection(this.db, 'users', user.uid, 'budgetCategories');
    await addDoc(categoriesRef, category);
  }

  /**
   * Update an existing budget category
   */
  async updateCategory(user: User, categoryId: string, updates: Partial<BudgetCategory>): Promise<void> {
    const categoryRef = doc(this.db, 'users', user.uid, 'budgetCategories', categoryId);
    await updateDoc(categoryRef, updates);
  }

  /**
   * Delete a budget category
   */
  async deleteCategory(user: User, categoryId: string): Promise<void> {
    const categoryRef = doc(this.db, 'users', user.uid, 'budgetCategories', categoryId);
    await deleteDoc(categoryRef);
  }

  /**
   * Get budget entries for a specific month
   */
  async getEntriesForMonth(user: User, month: string): Promise<BudgetEntry[]> {
    const entriesRef = collection(this.db, 'users', user.uid, 'budgetEntries');
    const q = query(
      entriesRef,
      where('date', '>=', `${month}-01`),
      where('date', '<=', `${month}-31`),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as BudgetEntry));
  }

  /**
   * Add a new budget entry
   */
  async addEntry(user: User, entry: Omit<BudgetEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const entriesRef = collection(this.db, 'users', user.uid, 'budgetEntries');
    const now = new Date();
    const newEntry = {
      ...entry,
      userId: user.uid,
      createdAt: now,
      updatedAt: now
    };
    const docRef = await addDoc(entriesRef, newEntry);
    return docRef.id;
  }

  /**
   * Update an existing budget entry
   */
  async updateEntry(user: User, entryId: string, updates: Partial<BudgetEntry>): Promise<void> {
    const entryRef = doc(this.db, 'users', user.uid, 'budgetEntries', entryId);
    await updateDoc(entryRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  /**
   * Delete a budget entry
   */
  async deleteEntry(user: User, entryId: string): Promise<void> {
    const entryRef = doc(this.db, 'users', user.uid, 'budgetEntries', entryId);
    await deleteDoc(entryRef);
  }

  /**
   * Get recurring expenses for a user
   */
  async getRecurringExpenses(user: User): Promise<RecurringExpense[]> {
    const recurringRef = collection(this.db, 'users', user.uid, 'recurringExpenses');
    const q = query(recurringRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as RecurringExpense));
  }

  /**
   * Add a new recurring expense
   */
  async addRecurringExpense(user: User, expense: Omit<RecurringExpense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const recurringRef = collection(this.db, 'users', user.uid, 'recurringExpenses');
    const now = new Date();
    const newExpense = {
      ...expense,
      userId: user.uid,
      createdAt: now,
      updatedAt: now
    };
    const docRef = await addDoc(recurringRef, newExpense);
    return docRef.id;
  }

  /**
   * Update a recurring expense
   */
  async updateRecurringExpense(user: User, expenseId: string, updates: Partial<RecurringExpense>): Promise<void> {
    const expenseRef = doc(this.db, 'users', user.uid, 'recurringExpenses', expenseId);
    await updateDoc(expenseRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  /**
   * Get budget data for graphs
   */
  async getBudgetData(user: User, month: string): Promise<BudgetData> {
    const [categories, entries] = await Promise.all([
      this.getCategories(user),
      this.getEntriesForMonth(user, month)
    ]);

    const totalSpent = entries
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);

    return {
      categories,
      entries,
      totalSpent,
      totalBudget,
      currentMonth: month
    };
  }
}

export default ManualBudgetService;
