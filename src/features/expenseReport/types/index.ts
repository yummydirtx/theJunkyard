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

export interface ExpenseItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface Expense {
  id: string;
  userId: string;
  totalAmount: number;
  description: string;
  date: string;
  category?: string;
  status: 'pending' | 'approved' | 'denied' | 'reimbursed';
  items?: ExpenseItem[];
  receiptUrl?: string;
  receiptFileName?: string;
  submittedAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  denialReason?: string;
  notes?: string;
}

export interface SharedExpenseReport {
  id: string;
  userId: string;
  expenses: Expense[];
  shareLink: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface ReceiptProcessingResult {
  totalAmount: number;
  transactionSummary: string;
  items: ExpenseItem[];
  confidence: number;
}

export interface ShareLinkData {
  shareId: string;
  userId: string;
  expenses: Expense[];
  generatedAt: Date;
  isActive: boolean;
}
