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
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  doc, 
  deleteDoc, 
  updateDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '../../../../contexts/AuthContext';
import { manualBudgetKeys } from '../../queries/queryKeys';

export interface BudgetEntry {
  id: string;
  amount: number;
  date: Date;
  description: string;
  createdAt: Date;
  category: string;
}

export interface CreateEntryData {
  amount: number;
  date: Date;
  description: string;
  category: string;
}

export interface UpdateEntryData {
  id: string;
  amount?: number;
  date?: Date;
  description?: string;
}

/**
 * Hook for managing budget entries with TanStack Query
 */
export function useEntries(month: string, category?: string) {
  const { activeUser, db } = useAuth();
  const queryClient = useQueryClient();

  // Query for entries in a specific category
  const {
    data: entries = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: manualBudgetKeys.categoryEntries(activeUser?.uid || '', month, category || ''),
    queryFn: async () => {
      if (!activeUser || !db || !category) return [];
      
      const entriesPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${category}/entries`;
      const entriesQuery = query(
        collection(db, entriesPath),
        orderBy('date', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const entriesSnapshot = await getDocs(entriesQuery);
      return entriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to JavaScript Dates
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        category,
      })) as BudgetEntry[];
    },
    enabled: !!activeUser && !!db && !!month && !!category,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Mutation for adding a new entry
  const addEntryMutation = useMutation({
    mutationFn: async (entryData: CreateEntryData) => {
      if (!activeUser || !db || !month) throw new Error('Missing required data');

      const { amount, date, description, category } = entryData;

      // Add the new entry document to Firestore
      const entriesPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${category}/entries`;
      const entry = {
        amount,
        date,
        description: description.trim(),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, entriesPath), entry);

      // Update category total
      const categoryPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${category}`;
      const categoryDoc = await getDoc(doc(db, categoryPath));
      const categoryData = categoryDoc.data();
      const newCategoryTotal = (categoryData?.total || 0) + amount;
      await updateDoc(doc(db, categoryPath), { total: newCategoryTotal });

      // Update month total
      const monthPath = `manualBudget/${activeUser.uid}/months/${month}`;
      const monthDoc = await getDoc(doc(db, monthPath));
      const monthData = monthDoc.data();
      const newMonthTotal = (monthData?.total || 0) + amount;
      await updateDoc(doc(db, monthPath), { total: newMonthTotal });

      return {
        id: docRef.id,
        ...entry,
        date,
        createdAt: new Date(),
        category,
      } as BudgetEntry;
    },
    onSuccess: (newEntry) => {
      // Invalidate and refetch the entries query to get the latest data
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.categoryEntries(activeUser!.uid, month, newEntry.category),
      });

      // Invalidate related queries to refresh totals
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.categories(activeUser!.uid, month),
      });
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.summary(activeUser!.uid, month),
      });
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.monthData(activeUser!.uid, month),
      });
    },
  });

  // Mutation for updating an entry
  const updateEntryMutation = useMutation({
    mutationFn: async (updateData: UpdateEntryData) => {
      if (!activeUser || !db || !month || !category) throw new Error('Missing required data');

      const { id, ...updates } = updateData;
      const entryPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${category}/entries/${id}`;
      
      // Get the current entry data to calculate amount difference if amount is being updated
      let amountDifference = 0;
      if ('amount' in updates && updates.amount !== undefined) {
        const currentEntryDoc = await getDoc(doc(db, entryPath));
        const currentEntryData = currentEntryDoc.data();
        if (currentEntryData) {
          amountDifference = updates.amount - currentEntryData.amount;
        }
      }

      // Update the entry document
      await updateDoc(doc(db, entryPath), {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Update totals if amount changed
      if (amountDifference !== 0) {
        // Update category total
        const categoryPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${category}`;
        const categoryDoc = await getDoc(doc(db, categoryPath));
        const categoryData = categoryDoc.data();
        const newCategoryTotal = (categoryData?.total || 0) + amountDifference;
        await updateDoc(doc(db, categoryPath), { total: newCategoryTotal });

        // Update month total
        const monthPath = `manualBudget/${activeUser.uid}/months/${month}`;
        const monthDoc = await getDoc(doc(db, monthPath));
        const monthData = monthDoc.data();
        const newMonthTotal = (monthData?.total || 0) + amountDifference;
        await updateDoc(doc(db, monthPath), { total: newMonthTotal });
      }

      return { id, ...updates };
    },
    onSuccess: (updatedData) => {
      // Invalidate and refetch the entries query
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.categoryEntries(activeUser!.uid, month, category!),
      });

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.categories(activeUser!.uid, month),
      });
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.summary(activeUser!.uid, month),
      });
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.monthData(activeUser!.uid, month),
      });
    },
  });

  // Mutation for deleting an entry
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      if (!activeUser || !db || !month || !category) throw new Error('Missing required data');

      // Get the entry data first to update totals
      const entryPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${category}/entries/${entryId}`;
      const entryDoc = await getDoc(doc(db, entryPath));
      const entryData = entryDoc.data();
      
      if (!entryData) throw new Error('Entry not found');

      // Delete the entry
      await deleteDoc(doc(db, entryPath));

      // Update category total
      const categoryPath = `manualBudget/${activeUser.uid}/months/${month}/categories/${category}`;
      const categoryDoc = await getDoc(doc(db, categoryPath));
      const categoryDocData = categoryDoc.data();
      const newCategoryTotal = (categoryDocData?.total || 0) - entryData.amount;
      await updateDoc(doc(db, categoryPath), { total: newCategoryTotal });

      // Update month total
      const monthPath = `manualBudget/${activeUser.uid}/months/${month}`;
      const monthDoc = await getDoc(doc(db, monthPath));
      const monthData = monthDoc.data();
      const newMonthTotal = (monthData?.total || 0) - entryData.amount;
      await updateDoc(doc(db, monthPath), { total: newMonthTotal });

      return entryId;
    },
    onSuccess: (deletedId) => {
      // Invalidate and refetch the entries query
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.categoryEntries(activeUser!.uid, month, category!),
      });

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.categories(activeUser!.uid, month),
      });
      queryClient.invalidateQueries({
        queryKey: manualBudgetKeys.summary(activeUser!.uid, month),
      });
    },
  });

  return {
    entries,
    isLoading,
    error,
    refetch,
    addEntry: addEntryMutation.mutate,
    updateEntry: updateEntryMutation.mutate,
    deleteEntry: deleteEntryMutation.mutate,
    isAddingEntry: addEntryMutation.isPending,
    isUpdatingEntry: updateEntryMutation.isPending,
    isDeletingEntry: deleteEntryMutation.isPending,
  };
}
