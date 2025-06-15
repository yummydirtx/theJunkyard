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
import { doc, addDoc, updateDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../../contexts/AuthContext';
import { manualBudgetKeys } from '../../queries/queryKeys';
import { queryFunctions } from '../../queries/queryFunctions';

interface RecurringExpenseDefinition {
  id?: string;
  description: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  userId?: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Hook for managing recurring expenses with TanStack Query
 */
export function useRecurringExpenses() {
  const { activeUser, db } = useAuth();
  const queryClient = useQueryClient();

  // Query for recurring expenses
  const {
    data: recurringExpenses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: manualBudgetKeys.recurringExpenses(activeUser?.uid || ''),
    queryFn: () => queryFunctions.fetchRecurringExpenses(db!, activeUser!.uid),
    enabled: !!activeUser && !!db,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for adding/updating recurring expense
  const addRecurringExpenseMutation = useMutation({
    mutationFn: async ({ 
      expenseData, 
      editingId = null 
    }: { 
      expenseData: Omit<RecurringExpenseDefinition, 'id' | 'userId' | 'createdAt' | 'updatedAt'>; 
      editingId?: string | null; 
    }) => {
      if (!activeUser || !db) throw new Error('User not authenticated or DB unavailable.');

      const dataToSave = {
        ...expenseData,
        userId: activeUser.uid,
        updatedAt: serverTimestamp(),
      };

      const recurringExpensesColRef = collection(db, `manualBudget/${activeUser.uid}/recurringExpenses`);
      
      if (editingId) {
        const docRef = doc(recurringExpensesColRef, editingId);
        await updateDoc(docRef, dataToSave);
        return { id: editingId, ...dataToSave };
      } else {
        const newData = { ...dataToSave, createdAt: serverTimestamp() };
        const docRef = await addDoc(recurringExpensesColRef, newData);
        return { id: docRef.id, ...newData };
      }
    },
    onSuccess: () => {
      // Invalidate and refetch recurring expenses
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.recurringExpenses(activeUser!.uid),
      });
    },
  });

  // Mutation for deleting recurring expense
  const deleteRecurringExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      if (!activeUser || !db) throw new Error('User not authenticated or DB unavailable.');

      const docRef = doc(db, `manualBudget/${activeUser.uid}/recurringExpenses`, expenseId);
      await deleteDoc(docRef);
      return expenseId;
    },
    onSuccess: () => {
      // Invalidate and refetch recurring expenses
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.recurringExpenses(activeUser!.uid),
      });
    },
  });

  return {
    recurringExpenses,
    isLoading,
    error,
    addRecurringExpense: addRecurringExpenseMutation.mutate,
    isAddingRecurringExpense: addRecurringExpenseMutation.isPending,
    addRecurringExpenseError: addRecurringExpenseMutation.error,
    deleteRecurringExpense: deleteRecurringExpenseMutation.mutate,
    isDeletingRecurringExpense: deleteRecurringExpenseMutation.isPending,
    deleteRecurringExpenseError: deleteRecurringExpenseMutation.error,
  };
}
