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
import { Expense, SharedExpenseReport, ShareLinkData } from '../types';

export class ExpenseReportService {
  constructor(private db: Firestore) {}

  /**
   * Get all expenses for a user
   */
  async getUserExpenses(user: User): Promise<Expense[]> {
    const expensesRef = collection(this.db, 'users', user.uid, 'expenses');
    const q = query(expensesRef, orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      processedAt: doc.data().processedAt?.toDate()
    } as Expense));
  }

  /**
   * Add a new expense
   */
  async addExpense(user: User, expense: Omit<Expense, 'id' | 'userId' | 'submittedAt' | 'updatedAt'>): Promise<string> {
    const expensesRef = collection(this.db, 'users', user.uid, 'expenses');
    const now = new Date();
    const newExpense = {
      ...expense,
      userId: user.uid,
      submittedAt: now,
      updatedAt: now
    };
    const docRef = await addDoc(expensesRef, newExpense);
    return docRef.id;
  }

  /**
   * Update an existing expense
   */
  async updateExpense(user: User, expenseId: string, updates: Partial<Expense>): Promise<void> {
    const expenseRef = doc(this.db, 'users', user.uid, 'expenses', expenseId);
    await updateDoc(expenseRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  /**
   * Delete an expense
   */
  async deleteExpense(user: User, expenseId: string): Promise<void> {
    const expenseRef = doc(this.db, 'users', user.uid, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  }

  /**
   * Get shared expenses by share ID
   */
  async getSharedExpenses(shareId: string): Promise<ShareLinkData | null> {
    const shareRef = doc(this.db, 'sharedExpenseReports', shareId);
    const snapshot = await getDoc(shareRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      shareId,
      ...data,
      generatedAt: data.generatedAt?.toDate(),
      expenses: data.expenses?.map((expense: any) => ({
        ...expense,
        submittedAt: expense.submittedAt?.toDate(),
        updatedAt: expense.updatedAt?.toDate(),
        processedAt: expense.processedAt?.toDate()
      }))
    } as ShareLinkData;
  }

  /**
   * Create a shared expense report
   */
  async createSharedExpenseReport(user: User, expenses: Expense[]): Promise<string> {
    const shareId = this.generateShareId();
    const shareRef = doc(this.db, 'sharedExpenseReports', shareId);
    
    const shareData: Omit<ShareLinkData, 'shareId'> = {
      userId: user.uid,
      expenses,
      generatedAt: new Date(),
      isActive: true
    };

    await setDoc(shareRef, shareData);
    return shareId;
  }

  /**
   * Update shared expense status
   */
  async updateSharedExpenseStatus(shareId: string, expenseId: string, status: string, denialReason?: string): Promise<void> {
    const shareRef = doc(this.db, 'sharedExpenseReports', shareId);
    const shareDoc = await getDoc(shareRef);
    
    if (!shareDoc.exists()) {
      throw new Error('Shared expense report not found');
    }

    const data = shareDoc.data();
    const expenses = data.expenses || [];
    
    const expenseIndex = expenses.findIndex((exp: any) => exp.id === expenseId);
    if (expenseIndex === -1) {
      throw new Error('Expense not found in shared report');
    }

    expenses[expenseIndex] = {
      ...expenses[expenseIndex],
      status,
      denialReason: status === 'denied' ? denialReason : null,
      processedAt: status !== 'pending' ? new Date() : null,
      updatedAt: new Date()
    };

    await updateDoc(shareRef, { expenses });
  }

  /**
   * Generate a unique share ID
   */
  private generateShareId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Calculate total pending amount from expenses
   */
  calculateTotalPendingAmount(expenses: Expense[]): number {
    return expenses
      .filter(expense => expense.status === 'pending')
      .reduce((total, expense) => total + expense.totalAmount, 0);
  }
}

export default ExpenseReportService;
