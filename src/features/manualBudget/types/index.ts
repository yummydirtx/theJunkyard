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

export interface BudgetCategory {
  name: string;
  color: string;
  budget: number;
  spent?: number;
}

export interface BudgetEntry {
  id: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  type: 'income' | 'expense';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetData {
  categories: BudgetCategory[];
  entries: BudgetEntry[];
  totalSpent: number;
  totalBudget: number;
  currentMonth: string;
}

export interface BudgetGraphData {
  totalSpent: number;
  totalGoal: number;
  categoriesData: Array<{
    name: string;
    value: number;
    budget: number;
  }>;
  monthlyData?: Array<{
    month: string;
    spent: number;
    budget: number;
  }>;
}
