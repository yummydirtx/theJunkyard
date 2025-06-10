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
 * Shared financial data types used across multiple features
 * Provides a clean contract for cross-feature communication
 */

export interface MonetaryAmount {
  value: number;
  currency?: string; // Default USD, future-proofing for internationalization
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface FinancialCategory {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

export interface FinancialTransaction {
  id: string;
  amount: MonetaryAmount;
  date: Date;
  description: string;
  category?: FinancialCategory;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetSummary {
  totalBudget: MonetaryAmount;
  totalSpent: MonetaryAmount;
  remainingBudget: MonetaryAmount;
  categoryBreakdown: Array<{
    category: FinancialCategory;
    budgeted: MonetaryAmount;
    spent: MonetaryAmount;
    remaining: MonetaryAmount;
  }>;
  period: DateRange;
}

export interface ExpenseSummary {
  totalExpenses: MonetaryAmount;
  pendingExpenses: MonetaryAmount;
  approvedExpenses: MonetaryAmount;
  deniedExpenses: MonetaryAmount;
  reimbursedExpenses: MonetaryAmount;
  categoryBreakdown: Array<{
    category: FinancialCategory;
    total: MonetaryAmount;
    count: number;
  }>;
  period: DateRange;
}

// Common status types used across features
export type TransactionStatus = 'pending' | 'approved' | 'denied' | 'reimbursed';
export type BudgetStatus = 'under-budget' | 'on-budget' | 'over-budget';

// Shared validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Common data export formats
export interface FinancialDataExport {
  format: 'json' | 'csv' | 'pdf';
  data: any;
  generatedAt: Date;
  period: DateRange;
  userId: string;
}

// Event types for cross-feature communication
export interface FinancialEvent {
  timestamp: Date;
  userId: string;
  source: string; // feature that emitted the event
}

export interface BudgetChangedEvent extends FinancialEvent {
  type: 'budget-changed';
  categoryId?: string;
  newAmount: MonetaryAmount;
  oldAmount?: MonetaryAmount;
  operation: 'created' | 'updated' | 'deleted';
}

export interface ExpenseStatusChangedEvent extends FinancialEvent {
  type: 'expense-status-changed';
  expenseId: string;
  newStatus: TransactionStatus;
  oldStatus?: TransactionStatus;
  amount: MonetaryAmount;
}

export interface ExpenseAddedEvent extends FinancialEvent {
  type: 'expense-added';
  expenseId: string;
  amount: MonetaryAmount;
  categoryId?: string;
}

export interface ExpenseDeletedEvent extends FinancialEvent {
  type: 'expense-deleted';
  expenseId: string;
  amount: MonetaryAmount;
  categoryId?: string;
}

export interface BudgetSummaryChangedEvent extends FinancialEvent {
  type: 'budget-summary-changed';
  summary: BudgetSummary;
}

export interface ExpenseSummaryChangedEvent extends FinancialEvent {
  type: 'expense-summary-changed';
  summary: ExpenseSummary;
}

export type FinancialEventType = 
  | BudgetChangedEvent
  | ExpenseStatusChangedEvent
  | ExpenseAddedEvent
  | ExpenseDeletedEvent
  | BudgetSummaryChangedEvent
  | ExpenseSummaryChangedEvent;
