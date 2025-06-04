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

import { useState, useCallback } from 'react';
import { FirebaseApp } from 'firebase/app';
import { ReceiptParsingService } from '../services/receiptParsingService';
import { ReceiptStateManager } from '../services/receiptStateManager';
import { 
    ReceiptProcessingState,
    FormCallbacks,
    ReceiptManagementCallbacks,
    ReceiptRefs
} from '../services/receiptProcessingSchema';

export interface UseReceiptProcessorParams {
    app: FirebaseApp;
    refs: ReceiptRefs;
    receiptCallbacks: ReceiptManagementCallbacks;
    formCallbacks: FormCallbacks;
}

export interface UseReceiptProcessorReturn extends ReceiptProcessingState {
    handleReceiptUploadAndParse: (newGsUri: string, mimeType: string) => Promise<void>;
    resetParsingState: () => void;
}

/**
 * Refactored hook for processing receipt uploads and AI parsing
 * This hook orchestrates receipt upload, AI parsing, and state management
 */
export function useReceiptProcessor(params: UseReceiptProcessorParams): UseReceiptProcessorReturn {
    const { app, refs, receiptCallbacks, formCallbacks } = params;

    // Processing state
    const [parsingReceipt, setParsingReceipt] = useState<boolean>(false);
    const [parsingError, setParsingError] = useState<string>('');
    const [parsingInfo, setParsingInfo] = useState<string>('');

    // Initialize services
    const parsingService = new ReceiptParsingService(app);
    const stateManager = new ReceiptStateManager(refs, receiptCallbacks, formCallbacks);

    /**
     * Reset all parsing state to initial values
     */
    const resetParsingState = useCallback((): void => {
        setParsingReceipt(false);
        setParsingError('');
        setParsingInfo('');
    }, []);

    /**
     * Handle the complete receipt upload and parsing workflow
     */
    const handleReceiptUploadAndParse = useCallback(async (
        newGsUri: string, 
        mimeType: string
    ): Promise<void> => {
        try {
            // Step 1: Clean up any previous receipt
            await stateManager.cleanupPreviousReceipt(newGsUri);
            
            // Step 2: Reset form fields and internal state
            stateManager.resetFormFields();
            resetParsingState();

            // Step 3: Validate inputs
            if (!newGsUri || !mimeType || !app) {
                if (!app) {
                    setParsingError("Cannot process upload: Firebase app unavailable.");
                }
                return;
            }

            // Step 4: Set up new receipt for processing
            await stateManager.setupNewReceipt(newGsUri);

            // Step 5: Start AI parsing
            await parseReceiptWithAI(newGsUri, mimeType);

        } catch (error: any) {
            console.error("Receipt Processor: Error in upload and parse workflow:", error);
            setParsingError(error.message || "Failed to process receipt upload.");
            await stateManager.cleanupFailedReceipt(newGsUri);
        }
    }, [app, stateManager, parsingService]);

    /**
     * Parse receipt using AI service
     */
    const parseReceiptWithAI = async (gsUri: string, mimeType: string): Promise<void> => {
        setParsingReceipt(true);
        setParsingError('');
        setParsingInfo('Analyzing receipt...');
        formCallbacks.setFormItems([]); // Clear previous items

        try {
            // Parse with AI service
            const result = await parsingService.parseReceipt(gsUri, mimeType);
            
            // Update form with results
            stateManager.updateFormWithResults(gsUri, result);
            setParsingInfo('Receipt analysis complete. Please review fields.');

        } catch (error: any) {
            console.error("Receipt Processor: AI parsing failed:", error);
            setParsingError(error.message);
            setParsingInfo('');
            
            // Clean up after failure
            stateManager.clearFormAfterFailure();
            await stateManager.cleanupFailedReceipt(gsUri);

        } finally {
            setParsingReceipt(false);
        }
    };

    return {
        parsingReceipt,
        parsingError,
        parsingInfo,
        handleReceiptUploadAndParse,
        resetParsingState
    };
}
