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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc, serverTimestamp, writeBatch, getDocs, collection, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../../../contexts/AuthContext';
import { manualBudgetKeys } from '../../queries/queryKeys';
import { queryFunctions } from '../../queries/queryFunctions';
import { BudgetCategory } from '../../types';

/**
 * Helper function to get available months for a user
 */
const getAvailableMonths = async (db: any, userId: string): Promise<string[]> => {
  const monthsCollectionRef = collection(db, `manualBudget/${userId}/months`);
  const monthsSnapshot = await getDocs(monthsCollectionRef);
  const monthsList = monthsSnapshot.docs.map(doc => doc.id);
  return monthsList.sort((a, b) => b.localeCompare(a)); // Sort newest first
};

/**
 * Helper function to find the most recent previous month with categories
 */
const findMostRecentPreviousMonth = async (db: any, userId: string, currentMonth: string): Promise<string | null> => {
  const availableMonths = await getAvailableMonths(db, userId);
  
  // Filter months that are before the current month
  const previousMonths = availableMonths.filter(month => month < currentMonth);
  
  // Return the most recent (first in the sorted array)
  return previousMonths.length > 0 ? previousMonths[0] : null;
};

/**
 * Helper function to apply recurring expenses to a month
 */
const applyRecurringExpensesToMonth = async (
  db: any, 
  userId: string, 
  targetMonth: string, 
  recurringDefs: any[], 
  monthCategoryNames: string[]
): Promise<{ addedTotal: number }> => {
  if (!recurringDefs || recurringDefs.length === 0) {
    return { addedTotal: 0 };
  }

  const batch = writeBatch(db);
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

    const entryData = {
      amount: def.amount,
      date: expenseDate,
      description: `Recurring: ${def.description}`,
      createdAt: serverTimestamp(),
      isRecurring: true,
      recurringExpenseDefId: def.id
    };

    const entryRef = doc(collection(db, `manualBudget/${userId}/months/${targetMonth}/categories/${def.categoryId}/entries`));
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
      const categoryDocRef = doc(db, `manualBudget/${userId}/months/${targetMonth}/categories/${categoryId}`);
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
    const monthDocRef = doc(db, `manualBudget/${userId}/months/${targetMonth}`);
    const monthSnap = await getDoc(monthDocRef);
    const currentMonthTotalSpent = monthSnap.exists() ? (monthSnap.data().total || 0) : 0;
    const finalMonthTotalSpent = currentMonthTotalSpent + addedRecurringExpensesTotalAmount;
    await updateDoc(monthDocRef, { total: finalMonthTotalSpent });
  }

  return { addedTotal: addedRecurringExpensesTotalAmount };
};

/**
 * Hook for managing budget categories with TanStack Query
 */
export function useCategories(month: string) {
  const { activeUser, db } = useAuth();
  const queryClient = useQueryClient();

  // Query for categories
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: manualBudgetKeys.categories(activeUser?.uid || '', month),
    queryFn: async () => {
      const currentCategories = await queryFunctions.fetchCategories(db!, activeUser!.uid, month);
      
      // If no categories exist for this month, try to copy from the most recent previous month
      if (currentCategories.length === 0) {
        const previousMonth = await findMostRecentPreviousMonth(db!, activeUser!.uid, month);
        
        if (previousMonth) {
          const previousCategories = await queryFunctions.fetchCategories(db!, activeUser!.uid, previousMonth);
          
          if (previousCategories.length > 0) {
            // Copy categories from previous month with reset spent amounts
            const batch = writeBatch(db!);
            const resetCategories = previousCategories.map(cat => ({
              ...cat,
              spent: 0,
              total: 0,
            }));

            // Calculate total goal for the month
            const totalGoal = resetCategories.reduce((sum, cat) => sum + (cat.budget || 0), 0);

            // Create month document first
            const monthDocRef = doc(db!, `manualBudget/${activeUser!.uid}/months/${month}`);
            batch.set(monthDocRef, {
              total: 0,
              goal: totalGoal,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }, { merge: true });

            // Create category documents
            for (const category of resetCategories) {
              const categoryDocRef = doc(db!, `manualBudget/${activeUser!.uid}/months/${month}/categories`, category.name);
              batch.set(categoryDocRef, {
                goal: category.budget, // Map budget to goal field
                color: category.color || '#1976d2',
                total: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
            
            await batch.commit();

            // Apply recurring expenses after categories are created
            try {
              const recurringExpenses = await queryFunctions.fetchRecurringExpenses(db!, activeUser!.uid);
              if (recurringExpenses.length > 0) {
                const categoryNames = resetCategories.map(cat => cat.name);
                const { addedTotal } = await applyRecurringExpensesToMonth(
                  db!, 
                  activeUser!.uid, 
                  month, 
                  recurringExpenses, 
                  categoryNames
                );
                
                // Update the month total if recurring expenses were added
                if (addedTotal > 0) {
                  const monthDocRef = doc(db!, `manualBudget/${activeUser!.uid}/months/${month}`);
                  await updateDoc(monthDocRef, { 
                    total: addedTotal,
                    updatedAt: serverTimestamp() 
                  });
                }
              }
            } catch (error) {
              console.warn('Failed to apply recurring expenses:', error);
            }

            // Invalidate cache to ensure fresh data is loaded
            queryClient.invalidateQueries({
              queryKey: manualBudgetKeys.categories(activeUser!.uid, month),
            });
            queryClient.invalidateQueries({
              queryKey: manualBudgetKeys.monthData(activeUser!.uid, month),
            });
            queryClient.invalidateQueries({
              queryKey: manualBudgetKeys.summary(activeUser!.uid, month),
            });
            
            // Fetch fresh categories after applying recurring expenses
            return await queryFunctions.fetchCategories(db!, activeUser!.uid, month);
          }
        }
      }
      
      return currentCategories;
    },
    enabled: !!activeUser && !!db && !!month,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutation for updating categories (bulk operation)
  const updateCategoriesMutation = useMutation({
    mutationFn: async (newCategories: BudgetCategory[]) => {
      if (!activeUser || !db || !month) throw new Error('Missing required data');

      // Use batch write to update all categories atomically
      const batch = writeBatch(db);
      
      for (const category of newCategories) {
        const categoryDocRef = doc(db, `manualBudget/${activeUser.uid}/months/${month}/categories`, category.name);
        batch.set(categoryDocRef, {
          goal: category.budget, // Map budget to goal field
          color: category.color || '#1976d2',
          total: category.spent || 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      
      await batch.commit();
      return newCategories;
    },
    onSuccess: (newCategories) => {
      // Update the cache
      queryClient.setQueryData(
        manualBudgetKeys.categories(activeUser!.uid, month),
        newCategories
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.monthData(activeUser!.uid, month),
      });
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.summary(activeUser!.uid, month),
      });
    },
  });

  // Mutation for adding a new month with categories from previous month
  const addNewMonthMutation = useMutation({
    mutationFn: async ({ 
      newMonth, 
      categoriesFromPrevMonth = [] 
    }: { 
      newMonth: string; 
      categoriesFromPrevMonth?: BudgetCategory[] 
    }) => {
      if (!activeUser || !db) throw new Error('User not authenticated or DB unavailable.');

      // Check if month already exists by checking if categories collection has any documents
      const existingCategories = await queryFunctions.fetchCategories(db, activeUser.uid, newMonth);

      if (existingCategories.length === 0 && categoriesFromPrevMonth.length > 0) {
        // Create new categories with reset spent amounts
        const batch = writeBatch(db);
        
        const resetCategories = categoriesFromPrevMonth.map(cat => ({
          ...cat,
          spent: 0,
          total: 0,
        }));

        for (const category of resetCategories) {
          const categoryDocRef = doc(db, `manualBudget/${activeUser.uid}/months/${newMonth}/categories`, category.name);
          batch.set(categoryDocRef, {
            goal: category.budget, // Map budget to goal field
            color: category.color || '#1976d2',
            total: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        
        await batch.commit();
        return resetCategories;
      }
      
      // Month already exists or no previous categories, return existing categories
      return existingCategories;
    },
    onSuccess: (newCategories, { newMonth }) => {
      // Update the cache for the new month
      queryClient.setQueryData(
        manualBudgetKeys.categories(activeUser!.uid, newMonth),
        newCategories
      );
    },
  });

  return {
    categories,
    isLoading,
    error,
    updateCategories: updateCategoriesMutation.mutate,
    isUpdatingCategories: updateCategoriesMutation.isPending,
    updateCategoriesError: updateCategoriesMutation.error,
    addNewMonth: addNewMonthMutation.mutate,
    isAddingNewMonth: addNewMonthMutation.isPending,
    addNewMonthError: addNewMonthMutation.error,
  };
}
