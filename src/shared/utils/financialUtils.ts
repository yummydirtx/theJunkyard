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

import { MonetaryAmount, DateRange, ValidationResult, BudgetStatus } from '../types/financial';

/**
 * Shared utilities for financial operations across features
 * Provides consistent formatting, validation, and calculation methods
 */

// Currency formatting utilities
export const formatCurrency = (amount: MonetaryAmount): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: amount.currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount.value);
};

export const formatAmount = (value: number, currency = 'USD'): string => {
  return formatCurrency({ value, currency });
};

// Amount validation utilities
export const validateAmount = (amount: number): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (isNaN(amount)) {
    errors.push('Amount must be a valid number');
  }

  if (amount < 0) {
    errors.push('Amount cannot be negative');
  }

  if (amount > 1000000) {
    warnings.push('Amount is unusually large');
  }

  if (amount === 0) {
    warnings.push('Amount is zero');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Date range utilities
export const isDateInRange = (date: Date, range: DateRange): boolean => {
  return date >= range.startDate && date <= range.endDate;
};

export const getCurrentMonthRange = (): DateRange => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return { startDate, endDate };
};

export const getMonthRange = (year: number, month: number): DateRange => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  return { startDate, endDate };
};

export const formatDateRange = (range: DateRange): string => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return `${formatter.format(range.startDate)} - ${formatter.format(range.endDate)}`;
};

// Amount parsing utilities
export const parseAmount = (amount: string | number): number => {
  if (typeof amount === 'number') {
    return Math.round(amount * 100) / 100;
  }
  
  const parsed = amount ? parseFloat(amount) : 0;
  return Math.round(parsed * 100) / 100;
};

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString();
};

export const getCurrentMonth = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
};

export const formatMonth = (monthStr: string): string => {
  try {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  } catch (e) {
    return monthStr;
  }
};

export const isValidMonth = (month: string): boolean => {
  return Boolean(month && /^\d{4}-\d{2}$/.test(month));
};

// Budget calculation utilities
export const calculateBudgetStatus = (budgeted: number, spent: number): BudgetStatus => {
  const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  
  if (percentage > 100) {
    return 'over-budget';
  } else if (percentage >= 90) {
    return 'on-budget';
  } else {
    return 'under-budget';
  }
};

export const calculateRemainingBudget = (budgeted: MonetaryAmount, spent: MonetaryAmount): MonetaryAmount => {
  return {
    value: Math.max(0, budgeted.value - spent.value),
    currency: budgeted.currency || spent.currency || 'USD'
  };
};

export const calculateBudgetPercentage = (spent: number, budgeted: number): number => {
  if (budgeted === 0) return 0;
  return Math.round((spent / budgeted) * 100);
};

// Amount aggregation utilities
export const sumAmounts = (amounts: MonetaryAmount[]): MonetaryAmount => {
  if (amounts.length === 0) {
    return { value: 0, currency: 'USD' };
  }

  const currency = amounts[0].currency || 'USD';
  const total = amounts.reduce((sum, amount) => sum + amount.value, 0);
  
  return { value: total, currency };
};

export const averageAmounts = (amounts: MonetaryAmount[]): MonetaryAmount => {
  if (amounts.length === 0) {
    return { value: 0, currency: 'USD' };
  }

  const sum = sumAmounts(amounts);
  return {
    value: sum.value / amounts.length,
    currency: sum.currency
  };
};

// Category name normalization
export const normalizeCategoryName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
};

export const displayCategoryName = (name: string): string => {
  return name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Month formatting utilities
export const formatMonthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const parseMonthKey = (monthKey: string): Date => {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1);
};

export const formatMonthDisplay = (monthKey: string): string => {
  const date = parseMonthKey(monthKey);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long'
  }).format(date);
};

// Percentage utilities
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
};

// Color utilities for financial status
export const getStatusColor = (status: BudgetStatus): string => {
  switch (status) {
    case 'under-budget':
      return '#4caf50'; // Green
    case 'on-budget':
      return '#ff9800'; // Orange
    case 'over-budget':
      return '#f44336'; // Red
    default:
      return '#757575'; // Grey
  }
};

export const getBudgetProgressColor = (percentage: number): string => {
  if (percentage <= 75) return '#4caf50'; // Green
  if (percentage <= 90) return '#ff9800'; // Orange
  if (percentage <= 100) return '#ff5722'; // Deep Orange
  return '#f44336'; // Red
};
