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
  serverTimestamp,
  writeBatch,
  Timestamp,
  FieldValue
} from 'firebase/firestore';

// Import shared types and event bus
import { 
  MonetaryAmount, 
  FinancialTransaction, 
  BudgetSummary,
  FinancialCategory
} from '../../../shared/types/financial';
import { financialEventBus, FinancialEvent } from '../../../shared/events/financialEventBus';

// Internal types that match the actual Firebase structure
export interface ManualBudgetUser {
  name: string;
  createdAt?: Timestamp | FieldValue;
}

export interface BudgetMonth {
  total: number;
  goal: number;
  createdAt?: Timestamp | FieldValue;
}

export interface BudgetCategory {
  goal: number;
  total: number;
  color: string;
  createdAt?: Timestamp | FieldValue;
}

export interface BudgetEntry {
  id?: string;
  amount: number;
  date: Date | Timestamp;
  description: string;
  createdAt?: Timestamp | FieldValue;
  isRecurring?: boolean;
  recurringExpenseDefId?: string;
}

export interface RecurringExpenseDefinition {
  id?: string;
  description: string;
  amount: number;
  categoryId: string;
  recurrenceType: 'specificDay' | 'lastDay';
  dayOfMonth?: number;
  userId: string;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface MonthCreationResult {
  copiedCategories: string[];
  newMonthTotalGoal: number;
}

export class ManualBudgetService {
  constructor(private db: Firestore) {}

  /**
   * Get user document for manual budget
   */
  async getUserDocument(userId: string): Promise<ManualBudgetUser | null> {
    const userDocRef = doc(this.db, 'manualBudget', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      return userDocSnap.data() as ManualBudgetUser;
    }
    return null;
  }

  /**
   * Create or update user document
   */
  async createUserDocument(userId: string, name: string): Promise<void> {
    const userDocRef = doc(this.db, 'manualBudget', userId);
    await setDoc(userDocRef, { name });
    
    // Initialize current month if it doesn't exist
    const currentMonth = this.getCurrentMonth();
    const monthDocRef = doc(this.db, `manualBudget/${userId}/months/${currentMonth}`);
    await setDoc(monthDocRef, {
      total: 0,
      goal: 0,
      createdAt: serverTimestamp()
    }, { merge: true });
  }

  /**
   * Get current month in YYYY-MM format
   */
  getCurrentMonth(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Get all category names for a specific month
   */
  async getCategories(userId: string, month: string): Promise<string[]> {
    const categoriesPath = `manualBudget/${userId}/months/${month}/categories`;
    const categoriesSnapshot = await getDocs(collection(this.db, categoriesPath));
    return categoriesSnapshot.docs.map(doc => doc.id);
  }

  /**
   * Get category data for a specific category in a month
   */
  async getCategoryData(userId: string, month: string, categoryName: string): Promise<BudgetCategory | null> {
    const categoryDocRef = doc(this.db, `manualBudget/${userId}/months/${month}/categories/${categoryName}`);
    const categoryDoc = await getDoc(categoryDocRef);
    
    if (categoryDoc.exists()) {
      return categoryDoc.data() as BudgetCategory;
    }
    return null;
  }

  /**
   * Get month data
   */
  async getMonthData(userId: string, month: string): Promise<BudgetMonth | null> {
    const monthDocRef = doc(this.db, `manualBudget/${userId}/months/${month}`);
    const monthDoc = await getDoc(monthDocRef);
    
    if (monthDoc.exists()) {
      return monthDoc.data() as BudgetMonth;
    }
    return null;
  }

  /**
   * Get all months for a user
   */
  async getAvailableMonths(userId: string): Promise<string[]> {
    const monthsCollectionRef = collection(this.db, `manualBudget/${userId}/months`);
    const monthsSnapshot = await getDocs(monthsCollectionRef);
    const monthsList = monthsSnapshot.docs.map(doc => doc.id);
    return monthsList.sort((a, b) => b.localeCompare(a)); // Sort newest first
  }

  /**
   * Create a new month by copying categories from the most recent previous month
   */
  async createMonthFromPrevious(userId: string, newMonth: string): Promise<MonthCreationResult> {
    let newMonthTotalGoal = 0;
    const copiedCategories: string[] = [];

    try {
      // Get all months and find previous ones
      const monthsCollectionRef = collection(this.db, `manualBudget/${userId}/months`);
      const monthsSnapshot = await getDocs(monthsCollectionRef);
      const monthsList = monthsSnapshot.docs.map(doc => doc.id).sort((a, b) => b.localeCompare(a));
      const previousMonths = monthsList.filter(month => month < newMonth);

      // Initialize new month document
      const newMonthDocRef = doc(this.db, `manualBudget/${userId}/months/${newMonth}`);
      await setDoc(newMonthDocRef, {
        total: 0,
        goal: 0,
        createdAt: serverTimestamp()
      });

      // Copy categories from most recent previous month if available
      if (previousMonths.length > 0) {
        const mostRecentPreviousMonth = previousMonths[0];
        const prevCategoriesPath = `manualBudget/${userId}/months/${mostRecentPreviousMonth}/categories`;
        const prevCategoriesSnapshot = await getDocs(collection(this.db, prevCategoriesPath));

        if (!prevCategoriesSnapshot.empty) {
          const batch = writeBatch(this.db);
          
          prevCategoriesSnapshot.forEach(categoryDoc => {
            const categoryName = categoryDoc.id;
            const categoryData = categoryDoc.data();
            const goalValue = typeof categoryData.goal === 'number' ? categoryData.goal : 0;
            const colorValue = categoryData.color || '#1976d2';

            copiedCategories.push(categoryName);
            newMonthTotalGoal += goalValue;

            const newCategoryDocRef = doc(this.db, `manualBudget/${userId}/months/${newMonth}/categories/${categoryName}`);
            batch.set(newCategoryDocRef, {
              goal: goalValue,
              total: 0,
              createdAt: serverTimestamp(),
              color: colorValue
            });
          });
          
          await batch.commit();
        }
      }

      // Update month's goal if categories were copied
      if (newMonthTotalGoal > 0) {
        await updateDoc(newMonthDocRef, { goal: newMonthTotalGoal });
      }

      return { copiedCategories, newMonthTotalGoal };
    } catch (error) {
      console.error(`Error in createMonthFromPrevious for ${newMonth}:`, error);
      return { copiedCategories: [], newMonthTotalGoal: 0 };
    }
  }

  /**
   * Get all recurring expense definitions for a user
   */
  async getRecurringExpenseDefinitions(userId: string): Promise<RecurringExpenseDefinition[]> {
    const recurringExpensesPath = `manualBudget/${userId}/recurringExpenses`;
    const q = query(collection(this.db, recurringExpensesPath), orderBy('description', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecurringExpenseDefinition));
  }

  /**
   * Add or update a recurring expense definition
   */
  async saveRecurringExpenseDefinition(
    userId: string, 
    expenseData: Omit<RecurringExpenseDefinition, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, 
    editingId?: string
  ): Promise<void> {
    const dataToSave = {
      ...expenseData,
      userId,
      updatedAt: serverTimestamp(),
    };

    const recurringExpensesColRef = collection(this.db, `manualBudget/${userId}/recurringExpenses`);
    
    if (editingId) {
      const docRef = doc(recurringExpensesColRef, editingId);
      await updateDoc(docRef, dataToSave);
    } else {
      const dataWithCreatedAt = {
        ...dataToSave,
        createdAt: serverTimestamp()
      };
      await addDoc(recurringExpensesColRef, dataWithCreatedAt);
    }
  }

  /**
   * Delete a recurring expense definition
   */
  async deleteRecurringExpenseDefinition(userId: string, expenseId: string): Promise<void> {
    const docRef = doc(this.db, `manualBudget/${userId}/recurringExpenses`, expenseId);
    await deleteDoc(docRef);
  }

  /**
   * Apply recurring expenses to a specific month
   */
  async applyRecurringExpensesToMonth(
    userId: string, 
    targetMonth: string, 
    recurringDefs: RecurringExpenseDefinition[], 
    monthCategoryNames: string[]
  ): Promise<{ addedTotal: number }> {
    if (!recurringDefs || recurringDefs.length === 0) {
      return { addedTotal: 0 };
    }

    const batch = writeBatch(this.db);
    const [year, monthIndexBase1] = targetMonth.split('-').map(Number);
    const monthIndexBase0 = monthIndexBase1 - 1;
    let addedRecurringExpensesTotalAmount = 0;
    const categoryRecurringAmounts: Record<string, number> = {};

    for (const def of recurringDefs) {
      if (!monthCategoryNames.includes(def.categoryId)) {
        continue; // Skip if category doesn't exist in this month
      }

      let expenseDate: Date;
      if (def.recurrenceType === 'lastDay') {
        expenseDate = new Date(year, monthIndexBase0 + 1, 0); // Last day of month
      } else {
        const lastDayOfMonth = new Date(year, monthIndexBase0 + 1, 0).getDate();
        const day = Math.min(def.dayOfMonth || 1, lastDayOfMonth);
        expenseDate = new Date(year, monthIndexBase0, day);
      }

      const entryData: Omit<BudgetEntry, 'id'> = {
        amount: def.amount,
        date: expenseDate,
        description: `Recurring: ${def.description}`,
        createdAt: serverTimestamp(),
        isRecurring: true,
        recurringExpenseDefId: def.id
      };

      const entryRef = doc(collection(this.db, `manualBudget/${userId}/months/${targetMonth}/categories/${def.categoryId}/entries`));
      batch.set(entryRef, entryData);
      addedRecurringExpensesTotalAmount += def.amount;
      categoryRecurringAmounts[def.categoryId] = (categoryRecurringAmounts[def.categoryId] || 0) + def.amount;
    }

    if (addedRecurringExpensesTotalAmount > 0) {
      await batch.commit();

      // Update category totals
      const categoryUpdatePromises = [];
      for (const categoryId in categoryRecurringAmounts) {
        const amountToAdd = categoryRecurringAmounts[categoryId];
        const categoryDocRef = doc(this.db, `manualBudget/${userId}/months/${targetMonth}/categories/${categoryId}`);
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

      // Update month total
      const monthDocRef = doc(this.db, `manualBudget/${userId}/months/${targetMonth}`);
      const monthSnap = await getDoc(monthDocRef);
      const currentMonthTotalSpent = monthSnap.exists() ? (monthSnap.data().total || 0) : 0;
      const finalMonthTotalSpent = currentMonthTotalSpent + addedRecurringExpensesTotalAmount;
      await updateDoc(monthDocRef, { total: finalMonthTotalSpent });
    }

    return { addedTotal: addedRecurringExpensesTotalAmount };
  }

  /**
   * Check if a month exists
   */
  async monthExists(userId: string, month: string): Promise<boolean> {
    const monthDocRef = doc(this.db, `manualBudget/${userId}/months/${month}`);
    const monthSnap = await getDoc(monthDocRef);
    return monthSnap.exists();
  }

  /**
   * Get entries for a specific category in a month
   */
  async getCategoryEntries(userId: string, month: string, categoryName: string): Promise<BudgetEntry[]> {
    const entriesPath = `manualBudget/${userId}/months/${month}/categories/${categoryName}/entries`;
    const entriesSnapshot = await getDocs(collection(this.db, entriesPath));
    return entriesSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as BudgetEntry));
  }

  /**
   * Add a new entry to a category
   */
  async addEntry(
    userId: string, 
    month: string, 
    categoryName: string, 
    entryData: Omit<BudgetEntry, 'id' | 'createdAt'>
  ): Promise<void> {
    const entriesColRef = collection(this.db, `manualBudget/${userId}/months/${month}/categories/${categoryName}/entries`);
    const dataWithTimestamp = {
      ...entryData,
      createdAt: serverTimestamp()
    };
    const entryDocRef = await addDoc(entriesColRef, dataWithTimestamp);

    // Update category total
    const categoryDocRef = doc(this.db, `manualBudget/${userId}/months/${month}/categories/${categoryName}`);
    const categorySnap = await getDoc(categoryDocRef);
    if (categorySnap.exists()) {
      const currentTotal = categorySnap.data().total || 0;
      await updateDoc(categoryDocRef, { total: currentTotal + entryData.amount });
    }

    // Update month total
    const monthDocRef = doc(this.db, `manualBudget/${userId}/months/${month}`);
    const monthSnap = await getDoc(monthDocRef);
    let newMonthTotal = 0;
    if (monthSnap.exists()) {
      const currentMonthTotal = monthSnap.data().total || 0;
      newMonthTotal = currentMonthTotal + entryData.amount;
      await updateDoc(monthDocRef, { total: newMonthTotal });
    }

    // Emit budget entry added event
    const addedEvent: FinancialEvent = {
      type: 'budget.entry-added',
      timestamp: new Date(),
      source: 'manual-budget',
      payload: {
        userId,
        month,
        categoryName,
        entryId: entryDocRef.id,
        amount: entryData.amount,
        description: entryData.description,
        monthTotal: newMonthTotal
      }
    };
    financialEventBus.emit(addedEvent);
  }

  /**
   * Update an existing entry
   */
  async updateEntry(
    userId: string, 
    month: string, 
    categoryName: string, 
    entryId: string, 
    updates: Partial<BudgetEntry>
  ): Promise<void> {
    const entryRef = doc(this.db, `manualBudget/${userId}/months/${month}/categories/${categoryName}/entries/${entryId}`);
    
    // Get current entry to calculate amount difference
    const entrySnap = await getDoc(entryRef);
    if (!entrySnap.exists()) {
      throw new Error('Entry not found');
    }
    
    const currentEntry = entrySnap.data() as BudgetEntry;
    const amountDifference = (updates.amount || currentEntry.amount) - currentEntry.amount;
    
    // Update the entry
    await updateDoc(entryRef, updates);
    
    let newMonthTotal = 0;
    // Update category total if amount changed
    if (amountDifference !== 0) {
      const categoryDocRef = doc(this.db, `manualBudget/${userId}/months/${month}/categories/${categoryName}`);
      const categorySnap = await getDoc(categoryDocRef);
      if (categorySnap.exists()) {
        const currentTotal = categorySnap.data().total || 0;
        await updateDoc(categoryDocRef, { total: currentTotal + amountDifference });
      }

      // Update month total
      const monthDocRef = doc(this.db, `manualBudget/${userId}/months/${month}`);
      const monthSnap = await getDoc(monthDocRef);
      if (monthSnap.exists()) {
        const currentMonthTotal = monthSnap.data().total || 0;
        newMonthTotal = currentMonthTotal + amountDifference;
        await updateDoc(monthDocRef, { total: newMonthTotal });
      }
    }

    // Emit budget entry updated event
    const updatedEvent: FinancialEvent = {
      type: 'budget.entry-updated',
      timestamp: new Date(),
      source: 'manual-budget',
      payload: {
        userId,
        month,
        categoryName,
        entryId,
        amountDifference,
        updatedAmount: updates.amount || currentEntry.amount,
        monthTotal: newMonthTotal || undefined
      }
    };
    financialEventBus.emit(updatedEvent);
  }

  /**
   * Delete an entry
   */
  async deleteEntry(
    userId: string, 
    month: string, 
    categoryName: string, 
    entryId: string
  ): Promise<void> {
    const entryRef = doc(this.db, `manualBudget/${userId}/months/${month}/categories/${categoryName}/entries/${entryId}`);
    
    // Get entry to know the amount for total updates
    const entrySnap = await getDoc(entryRef);
    if (!entrySnap.exists()) {
      throw new Error('Entry not found');
    }
    
    const entryData = entrySnap.data() as BudgetEntry;
    const entryAmount = entryData.amount;
    
    // Delete the entry
    await deleteDoc(entryRef);
    
    // Update category total
    const categoryDocRef = doc(this.db, `manualBudget/${userId}/months/${month}/categories/${categoryName}`);
    const categorySnap = await getDoc(categoryDocRef);
    if (categorySnap.exists()) {
      const currentTotal = categorySnap.data().total || 0;
      await updateDoc(categoryDocRef, { total: Math.max(0, currentTotal - entryAmount) });
    }

    // Update month total
    const monthDocRef = doc(this.db, `manualBudget/${userId}/months/${month}`);
    const monthSnap = await getDoc(monthDocRef);
    let newMonthTotal = 0;
    if (monthSnap.exists()) {
      const currentMonthTotal = monthSnap.data().total || 0;
      newMonthTotal = Math.max(0, currentMonthTotal - entryAmount);
      await updateDoc(monthDocRef, { total: newMonthTotal });
    }

    // Emit budget entry deleted event
    const deletedEvent: FinancialEvent = {
      type: 'budget.entry-deleted',
      timestamp: new Date(),
      source: 'manual-budget',
      payload: {
        userId,
        month,
        categoryName,
        entryId,
        amount: entryAmount,
        description: entryData.description,
        monthTotal: newMonthTotal
      }
    };
    financialEventBus.emit(deletedEvent);
  }

  /**
   * Update category data (goal, color, etc.)
   */
  async updateCategory(
    userId: string, 
    month: string, 
    categoryName: string, 
    updates: Partial<BudgetCategory>
  ): Promise<void> {
    const categoryDocRef = doc(this.db, `manualBudget/${userId}/months/${month}/categories/${categoryName}`);
    await updateDoc(categoryDocRef, updates);

    // Emit budget category updated event
    const updatedEvent: FinancialEvent = {
      type: 'budget.category-updated',
      timestamp: new Date(),
      source: 'manual-budget',
      payload: {
        userId,
        month,
        categoryName,
        updates
      }
    };
    financialEventBus.emit(updatedEvent);
  }

  /**
   * Create a new category in a month
   */
  async createCategory(
    userId: string, 
    month: string, 
    categoryName: string, 
    categoryData: Omit<BudgetCategory, 'createdAt'>
  ): Promise<void> {
    const categoryDocRef = doc(this.db, `manualBudget/${userId}/months/${month}/categories/${categoryName}`);
    const dataWithTimestamp = {
      ...categoryData,
      createdAt: serverTimestamp()
    };
    await setDoc(categoryDocRef, dataWithTimestamp);

    // Emit budget category created event
    const createdEvent: FinancialEvent = {
      type: 'budget.category-created',
      timestamp: new Date(),
      source: 'manual-budget',
      payload: {
        userId,
        month,
        categoryName,
        goal: categoryData.goal,
        color: categoryData.color
      }
    };
    financialEventBus.emit(createdEvent);
  }

  /**
   * Delete a category and all its entries
   */
  async deleteCategory(userId: string, month: string, categoryName: string): Promise<void> {
    // Get category data before deletion for event payload
    const categoryDocRef = doc(this.db, `manualBudget/${userId}/months/${month}/categories/${categoryName}`);
    const categorySnap = await getDoc(categoryDocRef);
    const categoryData = categorySnap.exists() ? categorySnap.data() as BudgetCategory : null;
    
    const batch = writeBatch(this.db);
    
    // Get all entries in the category first
    const entriesPath = `manualBudget/${userId}/months/${month}/categories/${categoryName}/entries`;
    const entriesSnapshot = await getDocs(collection(this.db, entriesPath));
    
    // Delete all entries
    entriesSnapshot.docs.forEach(entryDoc => {
      batch.delete(entryDoc.ref);
    });
    
    // Delete the category document
    batch.delete(categoryDocRef);
    
    await batch.commit();

    // Emit budget category deleted event
    const deletedEvent: FinancialEvent = {
      type: 'budget.category-deleted',
      timestamp: new Date(),
      source: 'manual-budget',
      payload: {
        userId,
        month,
        categoryName,
        deletedTotal: categoryData?.total || 0,
        entryCount: entriesSnapshot.docs.length
      }
    };
    financialEventBus.emit(deletedEvent);
  }
}
