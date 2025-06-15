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
import { doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useAuth } from '../../../../contexts/AuthContext';
import { manualBudgetKeys } from '../../queries/queryKeys';
import { queryFunctions } from '../../queries/queryFunctions';
import { BudgetCategory } from '../../types';

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
    queryFn: () => queryFunctions.fetchCategories(db!, activeUser!.uid, month),
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
