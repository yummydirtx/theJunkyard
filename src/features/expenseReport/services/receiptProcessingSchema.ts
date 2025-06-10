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
 * Schema definition for structured output from Vertex AI when processing receipts
 */
export const receiptSchema = {
    type: 'object',
    properties: {
        total_amount: {
            type: 'number',
            description: 'The final total amount paid on the receipt, including tax and tips. Extract only the numerical value.'
        },
        transaction_summary: {
            type: 'string',
            description: 'A brief summary of the transaction (e.g., "Groceries at Safeway", "Gas at Shell", "Dinner at Restaurant Name"). Identify the merchant and general category if possible.'
        },
        items: {
            type: 'array',
            description: 'List of items purchased. Extract the description and price (if available) for each item.',
            items: {
                type: 'object',
                properties: {
                    description: { type: 'string', description: 'Description of the purchased item.' },
                    price: { type: 'number', description: 'Price of the item, if clearly identifiable. Extract only the numerical value.' }
                },
                required: ['description']
            }
        }
    },
    required: ['total_amount']
} as const;

/**
 * Raw response from Vertex AI receipt processing
 */
export interface RawReceiptData {
    total_amount?: number;
    transaction_summary?: string;
    items?: Array<{
        description: string;
        price?: number;
    }>;
}

/**
 * Processing state for receipt analysis
 */
export interface ReceiptProcessingState {
    parsingReceipt: boolean;
    parsingError: string;
    parsingInfo: string;
}

/**
 * Form callbacks for updating expense form state
 */
export interface FormCallbacks {
    setFormReceiptGsUri: (uri: string) => void;
    setFormDescription: (description: string) => void;
    setFormAmount: (amount: string) => void;
    setFormItems: (items: any[]) => void;
}

/**
 * Receipt management callbacks
 */
export interface ReceiptManagementCallbacks {
    onDeleteStorageFile?: (gsUri: string) => Promise<void>;
    createPendingReceiptDoc: (gsUri: string) => Promise<string>;
    deletePendingReceiptDoc: (docId: string) => Promise<void>;
    hookSetUnsubmittedReceiptUri: (uri: string | null) => void;
}

/**
 * Reference objects for tracking receipt state
 */
export interface ReceiptRefs {
    pendingReceiptDocIdRef: React.MutableRefObject<string | null>;
    unsubmittedReceiptUriRef: React.MutableRefObject<string | null>;
}
