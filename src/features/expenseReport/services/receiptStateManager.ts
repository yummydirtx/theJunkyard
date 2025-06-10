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

import { 
    ReceiptRefs, 
    ReceiptManagementCallbacks, 
    FormCallbacks 
} from "./receiptProcessingSchema";
import { ReceiptProcessingResult } from "../types";

export class ReceiptStateManager {
    private refs: ReceiptRefs;
    private receiptCallbacks: ReceiptManagementCallbacks;
    private formCallbacks: FormCallbacks;

    constructor(
        refs: ReceiptRefs,
        receiptCallbacks: ReceiptManagementCallbacks,
        formCallbacks: FormCallbacks
    ) {
        this.refs = refs;
        this.receiptCallbacks = receiptCallbacks;
        this.formCallbacks = formCallbacks;
    }

    /**
     * Clean up previous receipt data before processing a new one
     */
    async cleanupPreviousReceipt(newGsUri: string): Promise<void> {
        const oldUnsubmittedUri = this.refs.unsubmittedReceiptUriRef.current;
        const oldPendingDocId = this.refs.pendingReceiptDocIdRef.current;

        // Delete previous unsubmitted receipt file if it exists and is different
        if (oldUnsubmittedUri && 
            oldUnsubmittedUri !== newGsUri && 
            this.receiptCallbacks.onDeleteStorageFile) {
            console.log("State Manager: Deleting previous unsubmitted file:", oldUnsubmittedUri);
            try {
                await this.receiptCallbacks.onDeleteStorageFile(oldUnsubmittedUri);
            } catch (delError) {
                console.error("State Manager: Failed to delete previous unsubmitted receipt file:", delError);
            }
        }

        // Delete previous pending document if it exists
        if (oldPendingDocId) {
            console.log("State Manager: Deleting previous pending doc:", oldPendingDocId);
            await this.receiptCallbacks.deletePendingReceiptDoc(oldPendingDocId);
        }

        // Clear tracking references
        this.refs.unsubmittedReceiptUriRef.current = null;
    }

    /**
     * Reset form fields to initial state
     */
    resetFormFields(): void {
        this.formCallbacks.setFormReceiptGsUri('');
        this.formCallbacks.setFormAmount('');
        this.formCallbacks.setFormDescription('');
        this.formCallbacks.setFormItems([]);
        this.receiptCallbacks.hookSetUnsubmittedReceiptUri(null);
    }

    /**
     * Set up new receipt for processing
     */
    async setupNewReceipt(gsUri: string): Promise<void> {
        // Update form and state with new receipt
        this.formCallbacks.setFormReceiptGsUri(gsUri);
        this.receiptCallbacks.hookSetUnsubmittedReceiptUri(gsUri);
        this.refs.unsubmittedReceiptUriRef.current = gsUri;

        // Create new pending receipt document
        try {
            await this.receiptCallbacks.createPendingReceiptDoc(gsUri);
        } catch (error) {
            console.error("State Manager: Failed to create pending receipt document:", error);
            await this.cleanupFailedReceipt(gsUri);
            throw new Error("Failed to track pending receipt. Please try uploading again.");
        }
    }

    /**
     * Update form with successful parsing results
     */
    updateFormWithResults(gsUri: string, result: ReceiptProcessingResult): void {
        this.formCallbacks.setFormAmount(result.totalAmount.toString());
        this.formCallbacks.setFormItems(result.items);
        this.formCallbacks.setFormDescription(result.transactionSummary);
        this.formCallbacks.setFormReceiptGsUri(gsUri);
    }

    /**
     * Clean up after failed receipt processing
     */
    async cleanupFailedReceipt(gsUri: string): Promise<void> {
        const docIdToDelete = this.refs.pendingReceiptDocIdRef.current;

        // Delete the uploaded file
        if (gsUri && this.receiptCallbacks.onDeleteStorageFile) {
            console.log("State Manager: Cleaning up failed receipt file:", gsUri);
            try {
                await this.receiptCallbacks.onDeleteStorageFile(gsUri);
            } catch (error) {
                console.error("State Manager: Failed to delete failed receipt file:", error);
            }
        }

        // Delete the pending document
        if (docIdToDelete) {
            console.log("State Manager: Cleaning up failed pending doc:", docIdToDelete);
            try {
                await this.receiptCallbacks.deletePendingReceiptDoc(docIdToDelete);
            } catch (error) {
                console.error("State Manager: Failed to delete failed pending doc:", error);
            }
        }

        // Clear tracking state
        this.clearTrackingState();
    }

    /**
     * Clear form after failed processing
     */
    clearFormAfterFailure(): void {
        this.formCallbacks.setFormItems([]);
        this.formCallbacks.setFormReceiptGsUri('');
    }

    /**
     * Clear all tracking references and state
     */
    private clearTrackingState(): void {
        this.refs.unsubmittedReceiptUriRef.current = null;
        this.receiptCallbacks.hookSetUnsubmittedReceiptUri(null);
    }
}
