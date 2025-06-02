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
  orderBy,
  onSnapshot,
  serverTimestamp,
  Firestore,
  FieldValue,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { FirebaseStorage, ref, deleteObject } from 'firebase/storage';

// Import shared types and event bus
import { 
  MonetaryAmount, 
  FinancialTransaction, 
  ExpenseSummary,
  TransactionStatus
} from '../../../shared/types/financial';
import { financialEventBus, FinancialEvent } from '../../../shared/events/financialEventBus';

// Types aligned with useUserExpenses hook data structure
export interface ExpenseItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  receiptUri?: string | null;
  items?: ExpenseItem[] | null;
  status: 'pending' | 'approved' | 'denied';
  denialReason?: string | null;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface NewExpenseData {
  description: string;
  amount: number;
  receiptUri?: string | null;
  items?: ExpenseItem[] | null;
}

export interface ShareLinkData {
  shareId: string;
  userId: string;
  expenses: Expense[];
  generatedAt: Date;
  isActive: boolean;
}

export class ExpenseReportService {
  constructor(private db: Firestore, private storage?: FirebaseStorage) {}

  /**
   * Subscribe to user expenses with real-time updates
   */
  subscribeToUserExpenses(userId: string, callback: (expenses: Expense[]) => void, onError?: (error: Error) => void): Unsubscribe {
    const expensesColRef = collection(this.db, "users", userId, "expenses");
    const q = query(expensesColRef, orderBy("createdAt", "desc"));

    return onSnapshot(q, (querySnapshot) => {
      const expenses: Expense[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        expenses.push({
          ...data,
          id: doc.id,
          status: data.status || 'pending',
          denialReason: data.denialReason || null,
        } as Expense);
      });
      callback(expenses);
    }, (error) => {
      console.error("Error fetching expenses: ", error);
      onError?.(error);
    });
  }

  /**
   * Add a new expense
   */
  async addExpense(userId: string, newExpense: NewExpenseData): Promise<string> {
    const expenseData = {
      userId,
      description: newExpense.description,
      amount: newExpense.amount,
      receiptUri: newExpense.receiptUri || null,
      items: newExpense.items || null,
      status: 'pending' as TransactionStatus,
      denialReason: null,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(this.db, "users", userId, "expenses"), expenseData);
    console.log("Document written with ID: ", docRef.id);

    // Emit expense added event
    const addedEvent: FinancialEvent = {
      type: 'expense.added',
      timestamp: new Date(),
      source: 'expense-report',
      payload: {
        userId,
        expenseId: docRef.id,
        amount: { value: newExpense.amount },
        description: newExpense.description,
      },
    };
    financialEventBus.emit(addedEvent);

    return docRef.id;
  }

  /**
   * Update an existing expense
   */
  async updateExpense(userId: string, expenseId: string, updatedData: Partial<Expense>): Promise<void> {
    const expenseDocRef = doc(this.db, "users", userId, "expenses", expenseId);
    
    // Get current expense data to track status changes
    const currentExpense = await getDoc(expenseDocRef);
    const currentData = currentExpense.exists() ? currentExpense.data() as Expense : null;
    
    const payload = {
      ...updatedData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(expenseDocRef, payload);
    console.log("Expense document successfully updated:", expenseId);

    // Emit status change event if status was updated
    if (updatedData.status && currentData && currentData.status !== updatedData.status) {
      const statusChangedEvent: FinancialEvent = {
        type: 'expense.status-changed',
        timestamp: new Date(),
        source: 'expense-report',
        payload: {
          userId,
          expenseId,
          previousStatus: currentData.status,
          newStatus: updatedData.status,
          amount: { value: currentData.amount || 0 },
          description: currentData.description,
        },
      };
      financialEventBus.emit(statusChangedEvent);
    }
  }

  /**
   * Delete an expense document
   */
  async deleteExpense(userId: string, expenseId: string): Promise<void> {
    // Get expense data before deletion for event emission
    const expenseDocRef = doc(this.db, "users", userId, "expenses", expenseId);
    const expenseDoc = await getDoc(expenseDocRef);
    const expenseData = expenseDoc.exists() ? expenseDoc.data() as Expense : null;
    
    await deleteDoc(expenseDocRef);
    console.log("Expense document successfully deleted!");

    // Emit expense deleted event
    if (expenseData) {
      const deletedEvent: FinancialEvent = {
        type: 'expense.deleted',
        timestamp: new Date(),
        source: 'expense-report',
        payload: {
          userId,
          expenseId,
          amount: { value: expenseData.amount || 0 },
          description: expenseData.description,
          status: expenseData.status,
        },
      };
      financialEventBus.emit(deletedEvent);
    }
  }

  /**
   * Delete a file from Firebase Storage
   */
  async deleteStorageFile(gsUri: string): Promise<void> {
    if (!gsUri || !this.storage) {
      console.log("No URI or storage, skipping deletion.");
      return;
    }
    
    console.log("Attempting to delete file from Storage:", gsUri);
    try {
      const storageRef = ref(this.storage, gsUri);
      await deleteObject(storageRef);
      console.log("File successfully deleted from Storage:", gsUri);
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn("Storage file not found (already deleted?):", gsUri);
      } else {
        console.error("Error deleting file from Storage:", gsUri, error);
        throw error;
      }
    }
  }

  /**
   * Delete an expense with its associated receipt
   */
  async deleteExpenseWithReceipt(userId: string, expenseId: string, expense: Expense): Promise<void> {
    // Delete Receipt from Storage first
    if (expense.receiptUri) {
      try {
        await this.deleteStorageFile(expense.receiptUri);
      } catch (storageError) {
        console.error("Failed to delete storage file during expense deletion:", storageError);
        // Decide if you want to proceed with Firestore deletion even if storage fails
      }
    }

    // Delete Expense Document from Firestore
    await this.deleteExpense(userId, expenseId);
  }

  /**
   * Calculate total pending amount from expenses
   */
  calculateTotalPendingAmount(expenses: Expense[]): number {
    return expenses
      .filter(expense => expense.status === 'pending')
      .reduce((total, expense) => total + (expense.amount || 0), 0);
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
        createdAt: expense.createdAt?.toDate(),
        updatedAt: expense.updatedAt?.toDate(),
      }))
    } as ShareLinkData;
  }

  /**
   * Create a shared expense report
   */
  async createSharedExpenseReport(userId: string, expenses: Expense[]): Promise<string> {
    const shareId = this.generateShareId();
    const shareRef = doc(this.db, 'sharedExpenseReports', shareId);
    
    const shareData: Omit<ShareLinkData, 'shareId'> = {
      userId,
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
}

export default ExpenseReportService;
