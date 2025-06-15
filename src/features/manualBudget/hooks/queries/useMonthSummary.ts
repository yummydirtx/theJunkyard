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

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../../contexts/AuthContext';
import { manualBudgetKeys } from '../../queries/queryKeys';
import { queryFunctions } from '../../queries/queryFunctions';

/**
 * Hook for fetching comprehensive month summary data
 * Includes categories with spending, entries, totals, etc.
 */
export function useMonthSummary(month: string) {
  const { activeUser, db } = useAuth();

  const {
    data: monthSummary,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: manualBudgetKeys.summary(activeUser?.uid || '', month),
    queryFn: () => queryFunctions.fetchMonthSummary(db!, activeUser!.uid, month),
    enabled: !!activeUser && !!db && !!month,
    staleTime: 1 * 60 * 1000, // 1 minute (shorter for summary data)
  });

  return {
    monthSummary,
    categories: monthSummary?.categories || [],
    entries: monthSummary?.entries || [],
    totalBudget: monthSummary?.totalBudget || 0,
    totalSpent: monthSummary?.totalSpent || 0,
    totalIncome: monthSummary?.totalIncome || 0,
    remainingBudget: monthSummary?.remainingBudget || 0,
    isLoading,
    error,
    refetch,
  };
}
