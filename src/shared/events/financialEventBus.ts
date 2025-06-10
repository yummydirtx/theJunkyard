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

import { BudgetSummary, ExpenseSummary, FinancialTransaction, MonetaryAmount } from '../types/financial';

/**
 * Lightweight event bus for cross-feature communication
 * Enables features to communicate without direct dependencies
 */

export interface FinancialEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string; // Which feature emitted the event
}

// Event types for cross-feature communication
export interface BudgetUpdatedEvent extends FinancialEvent {
  type: 'budget.updated';
  payload: {
    userId: string;
    month: string;
    summary: BudgetSummary;
  };
  source: 'manualBudget';
}

export interface ExpenseUpdatedEvent extends FinancialEvent {
  type: 'expense.updated';
  payload: {
    userId: string;
    expenseId: string;
    previousStatus?: string;
    newStatus: string;
    amount: MonetaryAmount;
  };
  source: 'expenseReport';
}

export interface CategoryCreatedEvent extends FinancialEvent {
  type: 'category.created';
  payload: {
    userId: string;
    categoryId: string;
    categoryName: string;
    source: 'manualBudget' | 'expenseReport';
  };
  source: string;
}

export interface MonthClosedEvent extends FinancialEvent {
  type: 'month.closed';
  payload: {
    userId: string;
    month: string;
    finalSummary: BudgetSummary;
  };
  source: 'manualBudget';
}

export interface ExpenseReimbursedEvent extends FinancialEvent {
  type: 'expense.reimbursed';
  payload: {
    userId: string;
    expenseIds: string[];
    totalAmount: MonetaryAmount;
    reimbursedAt: Date;
  };
  source: 'expenseReport';
}

// Union type of all financial events
export type FinancialEventTypes = 
  | BudgetUpdatedEvent 
  | ExpenseUpdatedEvent 
  | CategoryCreatedEvent 
  | MonthClosedEvent
  | ExpenseReimbursedEvent;

type EventCallback<T extends FinancialEvent = FinancialEvent> = (event: T) => void | Promise<void>;

/**
 * Simple event bus implementation for feature communication
 */
class FinancialEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private eventHistory: FinancialEvent[] = [];
  private maxHistorySize = 100; // Keep last 100 events for debugging

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T extends FinancialEvent>(eventType: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback as EventCallback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback as EventCallback);
        if (callbacks.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T extends FinancialEvent>(event: T): void {
    // Add timestamp if not provided
    const eventWithTimestamp: T = {
      ...event,
      timestamp: event.timestamp || new Date()
    };

    // Store in history
    this.eventHistory.push(eventWithTimestamp);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify subscribers
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(eventWithTimestamp);
        } catch (error) {
          console.error(`Error in event callback for ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Get recent event history (useful for debugging)
   */
  getEventHistory(eventType?: string): FinancialEvent[] {
    if (eventType) {
      return this.eventHistory.filter(event => event.type === eventType);
    }
    return [...this.eventHistory];
  }

  /**
   * Clear all listeners and history
   */
  clear(): void {
    this.listeners.clear();
    this.eventHistory = [];
  }

  /**
   * Get all active event types
   */
  getActiveEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }
}

// Singleton instance for the application
export const financialEventBus = new FinancialEventBus();

export default financialEventBus;
