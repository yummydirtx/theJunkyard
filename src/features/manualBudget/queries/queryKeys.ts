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

/**
 * Query keys factory for manual budget feature
 * Provides consistent query key generation for TanStack Query
 */
export const manualBudgetKeys = {
  all: ['manualBudget'] as const,
  
  // User-specific queries
  user: (userId: string) => [...manualBudgetKeys.all, 'user', userId] as const,
  userData: (userId: string) => [...manualBudgetKeys.user(userId), 'data'] as const,
  
  // Categories queries
  categories: (userId: string, month: string) => 
    [...manualBudgetKeys.user(userId), 'categories', month] as const,
  
  // Entries queries
  entries: (userId: string, month: string) => 
    [...manualBudgetKeys.user(userId), 'entries', month] as const,
  
  // Category-specific entries queries
  categoryEntries: (userId: string, month: string, category: string) => 
    [...manualBudgetKeys.entries(userId, month), 'category', category] as const,
  
  // Recurring expenses queries
  recurringExpenses: (userId: string) => 
    [...manualBudgetKeys.user(userId), 'recurringExpenses'] as const,
  
  // Month data queries
  monthData: (userId: string, month: string) => 
    [...manualBudgetKeys.user(userId), 'month', month] as const,
  
  // Summary queries
  summary: (userId: string, month: string) => 
    [...manualBudgetKeys.user(userId), 'summary', month] as const,
};
