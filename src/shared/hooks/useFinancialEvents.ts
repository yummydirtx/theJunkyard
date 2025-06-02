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

import { useEffect, useRef, useCallback } from 'react';
import { financialEventBus, FinancialEvent, FinancialEventTypes } from '../events/financialEventBus';

/**
 * Hook for subscribing to financial events across features
 * Enables features to react to events from other features without direct coupling
 */
export function useFinancialEvents<T extends FinancialEvent = FinancialEvent>(
  eventType: string,
  callback: (event: T) => void | Promise<void>,
  dependencies: any[] = []
) {
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = financialEventBus.subscribe<T>(eventType, (event) => {
      callbackRef.current(event);
    });

    return unsubscribe;
  }, [eventType, ...dependencies]);
}

/**
 * Hook for emitting financial events from features
 * Provides a consistent way for features to communicate with other features
 */
export function useFinancialEventEmitter(source: string) {
  return useCallback(<T extends FinancialEvent>(event: Omit<T, 'timestamp' | 'source'>) => {
    const eventWithSource: T = {
      ...event,
      source,
      timestamp: new Date()
    } as T;
    
    financialEventBus.emit(eventWithSource);
  }, [source]);
}

/**
 * Hook for subscribing to budget-related events
 * Specifically designed for features that need to react to budget changes
 */
export function useBudgetEvents(
  callback: (event: FinancialEventTypes) => void | Promise<void>,
  dependencies: any[] = []
) {
  useFinancialEvents('budget.updated', callback, dependencies);
  useFinancialEvents('month.closed', callback, dependencies);
  useFinancialEvents('category.created', callback, dependencies);
}

/**
 * Hook for subscribing to expense-related events
 * Specifically designed for features that need to react to expense changes
 */
export function useExpenseEvents(
  callback: (event: FinancialEventTypes) => void | Promise<void>,
  dependencies: any[] = []
) {
  useFinancialEvents('expense.updated', callback, dependencies);
  useFinancialEvents('expense.reimbursed', callback, dependencies);
}

/**
 * Hook for getting event history and debugging
 * Useful for development and troubleshooting cross-feature communication
 */
export function useEventHistory(eventType?: string) {
  return useCallback(() => {
    return financialEventBus.getEventHistory(eventType);
  }, [eventType]);
}

/**
 * Hook for managing cross-feature data synchronization
 * Provides a pattern for features to stay in sync with each other
 */
export function useCrossFeatureSync<T>(
  eventTypes: string[],
  syncCallback: (event: FinancialEvent) => T | Promise<T>,
  dependencies: any[] = []
) {
  const syncCallbackRef = useRef(syncCallback);
  
  useEffect(() => {
    syncCallbackRef.current = syncCallback;
  }, [syncCallback]);

  useEffect(() => {
    const unsubscribes = eventTypes.map(eventType => 
      financialEventBus.subscribe(eventType, async (event) => {
        try {
          await syncCallbackRef.current(event);
        } catch (error) {
          console.error(`Error in cross-feature sync for ${eventType}:`, error);
        }
      })
    );

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [eventTypes.join(','), ...dependencies]);
}
