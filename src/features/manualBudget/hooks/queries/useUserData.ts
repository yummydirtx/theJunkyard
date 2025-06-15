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
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../../contexts/AuthContext';
import { manualBudgetKeys } from '../../queries/queryKeys';
import { queryFunctions } from '../../queries/queryFunctions';

interface UserData {
  name: string;
  createdAt: any;
  updatedAt: any;
}

/**
 * Hook for managing user data with TanStack Query
 */
export function useUserData() {
  const { activeUser, db } = useAuth();
  const queryClient = useQueryClient();

  // Query for user data
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: manualBudgetKeys.userData(activeUser?.uid || ''),
    queryFn: () => queryFunctions.fetchUserData(db!, activeUser!.uid),
    enabled: !!activeUser && !!db,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for creating/updating user document
  const createUserMutation = useMutation({
    mutationFn: async (userName: string) => {
      if (!activeUser || !db) throw new Error('User not authenticated or DB unavailable.');

      const userDocRef = doc(db, 'manualBudget', activeUser.uid);
      const userData = {
        name: userName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(userDocRef, userData);
      return { ...userData, name: userName };
    },
    onSuccess: (newUserData) => {
      // Update the cache with the new user data
      queryClient.setQueryData(
        manualBudgetKeys.userData(activeUser!.uid),
        newUserData
      );
    },
  });

  return {
    userData,
    isLoading,
    error,
    name: userData?.name || '',
    needsNamePrompt: !!activeUser && !userData?.name && !isLoading,
    createUser: createUserMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    createUserError: createUserMutation.error,
  };
}
