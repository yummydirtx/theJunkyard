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

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, setDoc, getDoc, serverTimestamp, collection, deleteDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../../../../contexts/AuthContext';
import { manualBudgetKeys } from '../../queries/queryKeys';

export interface UpdateCategoryData {
  currentName: string;
  newName?: string;
  goal?: number;
  color?: string;
}

/**
 * Hook for individual category operations (update, delete)
 */
export function useCategoryOperations(month: string) {
  const { activeUser, db } = useAuth();
  const queryClient = useQueryClient();

  // Mutation for updating a single category
  const updateCategoryMutation = useMutation({
    mutationFn: async (updateData: UpdateCategoryData) => {
      if (!activeUser || !db || !month) throw new Error('Missing required data');

      const { currentName, newName, goal, color } = updateData;
      const oldCategoryPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${currentName}`;
      const monthPath = `manualBudget/${activeUser.uid}/months/${month}`;

      // Get current category data
      const categoryDoc = await getDoc(doc(db, oldCategoryPath));
      if (!categoryDoc.exists()) {
        throw new Error('Category not found');
      }

      const categoryData = categoryDoc.data();
      const oldGoal = categoryData.goal || 0;
      const newGoal = goal !== undefined ? goal : oldGoal;
      const goalDifference = newGoal - oldGoal;

      // If only updating goal/color (not name), update in place
      if (!newName || newName === currentName) {
        await updateDoc(doc(db, oldCategoryPath), {
          goal: newGoal,
          color: color || categoryData.color,
          updatedAt: serverTimestamp(),
        });

        // Update month total goal if changed
        if (goalDifference !== 0) {
          const monthDoc = await getDoc(doc(db, monthPath));
          const monthData = monthDoc.data();
          const newTotalGoal = (monthData?.goal || 0) + goalDifference;
          await updateDoc(doc(db, monthPath), {
            goal: Math.max(0, newTotalGoal),
            updatedAt: serverTimestamp(),
          });
        }

        return { currentName, newName: currentName, goal: newGoal, color };
      }

      // If renaming category, create new and transfer data
      const newCategoryPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${newName}`;

      // Check if new category name already exists
      const newCategoryDoc = await getDoc(doc(db, newCategoryPath));
      if (newCategoryDoc.exists()) {
        throw new Error('A category with this name already exists');
      }

      // Create new category with updated data
      await setDoc(doc(db, newCategoryPath), {
        goal: newGoal,
        total: categoryData.total || 0,
        color: color || categoryData.color,
        createdAt: categoryData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Transfer all entries from old category to new category
      const entriesPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${currentName}/entries`;
      const entriesSnapshot = await getDocs(collection(db, entriesPath));

      // Create new entries collection under new category
      const newEntriesPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${newName}/entries`;

      // Transfer each entry
      const transferPromises = entriesSnapshot.docs.map(entryDoc => {
        const entryData = entryDoc.data();
        return setDoc(doc(db, `${newEntriesPath}/${entryDoc.id}`), entryData);
      });

      await Promise.all(transferPromises);

      // Delete old category after transfer
      await deleteDoc(doc(db, oldCategoryPath));

      // Update month total goal if changed
      if (goalDifference !== 0) {
        const monthDoc = await getDoc(doc(db, monthPath));
        const monthData = monthDoc.data();
        const newTotalGoal = (monthData?.goal || 0) + goalDifference;
        await updateDoc(doc(db, monthPath), {
          goal: Math.max(0, newTotalGoal),
          updatedAt: serverTimestamp(),
        });
      }

      return { currentName, newName, goal: newGoal, color };
    },
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.categories(activeUser!.uid, month),
      });

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.monthData(activeUser!.uid, month),
      });
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.summary(activeUser!.uid, month),
      });

      // Invalidate all entry queries as category name might have changed
      queryClient.invalidateQueries({
        queryKey: ['manualBudget', activeUser!.uid, month, 'entries'],
      });
    },
  });

  // Mutation for deleting a category
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryName: string) => {
      if (!activeUser || !db || !month) throw new Error('Missing required data');

      const categoryPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${categoryName}`;
      const monthPath = `manualBudget/${activeUser.uid}/months/${month}`;

      // Get current category data to update month totals
      const categoryDoc = await getDoc(doc(db, categoryPath));
      if (!categoryDoc.exists()) {
        throw new Error('Category not found');
      }

      const categoryData = categoryDoc.data();
      const categoryGoal = categoryData.goal || 0;
      const categoryTotal = categoryData.total || 0;

      // Delete all entries in the category first
      const entriesPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${categoryName}/entries`;
      const entriesSnapshot = await getDocs(collection(db, entriesPath));
      
      const deleteEntryPromises = entriesSnapshot.docs.map(entryDoc => 
        deleteDoc(entryDoc.ref)
      );
      await Promise.all(deleteEntryPromises);

      // Delete the category document
      await deleteDoc(doc(db, categoryPath));

      // Update month totals
      const monthDoc = await getDoc(doc(db, monthPath));
      const monthData = monthDoc.data();
      const newTotalGoal = Math.max(0, (monthData?.goal || 0) - categoryGoal);
      const newTotalSpent = Math.max(0, (monthData?.total || 0) - categoryTotal);
      
      await updateDoc(doc(db, monthPath), {
        goal: newTotalGoal,
        total: newTotalSpent,
        updatedAt: serverTimestamp(),
      });

      return categoryName;
    },
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.categories(activeUser!.uid, month),
      });

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.monthData(activeUser!.uid, month),
      });
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.summary(activeUser!.uid, month),
      });
    },
  });

  return {
    updateCategory: updateCategoryMutation.mutate,
    isUpdatingCategory: updateCategoryMutation.isPending,
    updateCategoryError: updateCategoryMutation.error,
    deleteCategory: deleteCategoryMutation.mutate,
    isDeletingCategory: deleteCategoryMutation.isPending,
    deleteCategoryError: deleteCategoryMutation.error,
  };
}
