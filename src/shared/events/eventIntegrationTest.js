// Event Integration Test - Validates cross-feature communication
// This file demonstrates how the event system enables feature decoupling

import { financialEventBus } from './financialEventBus.ts';

/**
 * Test function to validate event emission and subscription works correctly
 * This can be called from the browser console to test the event system
 */
export function testEventIntegration() {
    console.log('🧪 Testing Financial Event Bus Integration...');
    
    // Test 1: Basic event emission and subscription
    const testEvent = {
        type: 'budget.entry-added',
        timestamp: new Date(),
        source: 'manual-budget',
        payload: {
            userId: 'test-user',
            month: '2025-06',
            categoryName: 'Food',
            entryId: 'test-entry-123',
            amount: 25.50,
            description: 'Lunch',
            monthTotal: 125.75
        }
    };

    // Subscribe to budget events
    const unsubscribeBudget = financialEventBus.subscribe('budget.*', (event) => {
        console.log('✅ Budget event received:', event.type, event.payload);
    });

    // Subscribe to expense events
    const unsubscribeExpense = financialEventBus.subscribe('expense.*', (event) => {
        console.log('✅ Expense event received:', event.type, event.payload);
    });

    // Test budget event emission
    console.log('📤 Emitting budget.entry-added event...');
    financialEventBus.emit(testEvent);

    // Test expense event emission
    const expenseEvent = {
        type: 'expense.added',
        timestamp: new Date(),
        source: 'expense-report',
        payload: {
            userId: 'test-user',
            expenseId: 'exp-456',
            amount: 32.99,
            description: 'Dinner receipt'
        }
    };

    console.log('📤 Emitting expense.added event...');
    financialEventBus.emit(expenseEvent);

    // Clean up subscriptions after 2 seconds
    setTimeout(() => {
        unsubscribeBudget();
        unsubscribeExpense();
        console.log('🧹 Event test completed, subscriptions cleaned up');
    }, 2000);

    return {
        message: 'Event integration test completed! Check console for results.',
        eventsEmitted: 2,
        subscriptionsCreated: 2
    };
}

/**
 * Test cross-feature communication scenarios
 */
export function testCrossFeatureCommunication() {
    console.log('🔄 Testing Cross-Feature Communication Scenarios...');
    
    // Simulate budget update affecting expense calculations
    const budgetSummaryEvent = {
        type: 'budget.summary-changed',
        timestamp: new Date(),
        source: 'manual-budget',
        payload: {
            userId: 'test-user',
            month: '2025-06',
            totalSpent: 245.67,
            totalBudget: 500.00,
            remainingBudget: 254.33
        }
    };

    // Simulate expense status change affecting budget view
    const expenseStatusEvent = {
        type: 'expense.status-changed',
        timestamp: new Date(),
        source: 'expense-report',
        payload: {
            userId: 'test-user',
            expenseId: 'exp-789',
            previousStatus: 'pending',
            newStatus: 'approved',
            amount: 89.50
        }
    };

    const unsubscribe1 = financialEventBus.subscribe('budget.summary-changed', (event) => {
        console.log('📊 Budget summary changed - Expense Report could update comparisons:', event.payload);
    });

    const unsubscribe2 = financialEventBus.subscribe('expense.status-changed', (event) => {
        console.log('💳 Expense status changed - Budget could update forecasts:', event.payload);
    });

    financialEventBus.emit(budgetSummaryEvent);
    financialEventBus.emit(expenseStatusEvent);

    setTimeout(() => {
        unsubscribe1();
        unsubscribe2();
        console.log('✨ Cross-feature communication test completed!');
    }, 1000);
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
    window.testEventIntegration = testEventIntegration;
    window.testCrossFeatureCommunication = testCrossFeatureCommunication;
}
