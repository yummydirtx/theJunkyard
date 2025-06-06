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

import { getVertexAI, getGenerativeModel } from "firebase/vertexai";
import { FirebaseApp } from "firebase/app";
import { receiptSchema, RawReceiptData } from "./receiptProcessingSchema";
import { ReceiptProcessingResult } from "../types";

export class ReceiptParsingService {
    private app: FirebaseApp;

    constructor(app: FirebaseApp) {
        this.app = app;
    }

    /**
     * Parse a receipt using Vertex AI
     */
    async parseReceipt(gsUri: string, mimeType: string): Promise<ReceiptProcessingResult> {
        if (!gsUri || !mimeType || !this.app) {
            throw new Error("Missing file URI, MIME type, or Firebase app instance for parsing.");
        }

        try {
            const vertexAI = getVertexAI(this.app);
            const generativeModel = getGenerativeModel(vertexAI, {
                model: "gemini-2.0-flash",
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: receiptSchema as any,
                },
            });

            const prompt = 'Extract the total amount, a brief transaction summary (like "Groceries at Store" or "Gas at Station"), and item descriptions/prices from this receipt image/PDF. Provide the output in the specified JSON format.';
            const requestPayload = {
                contents: [{ 
                    role: 'user' as const, 
                    parts: [
                        { fileData: { mimeType, fileUri: gsUri } }, 
                        { text: prompt }
                    ] 
                }]
            };

            console.log("Receipt Parser: Sending request to Gemini:", JSON.stringify(requestPayload, null, 2));
            const result = await generativeModel.generateContent(requestPayload);
            const response = result.response;
            console.log("Receipt Parser: Raw Gemini Response Text:", response.text());

            return this.processAIResponse(response.text());
        } catch (apiError: any) {
            throw this.createUserFriendlyError(apiError);
        }
    }

    /**
     * Process the AI response and convert to standardized format
     */
    private processAIResponse(responseText: string): ReceiptProcessingResult {
        try {
            const structuredData: RawReceiptData = JSON.parse(responseText);
            console.log('Receipt Parser: Parsed Data:', structuredData);

            const items = (structuredData.items || []).map(item => ({
                description: item.description,
                price: item.price || 0,
                quantity: 1
            }));

            const transactionSummary = this.generateTransactionSummary(
                structuredData.transaction_summary,
                items
            );

            return {
                totalAmount: structuredData.total_amount || 0,
                transactionSummary,
                items,
                confidence: this.calculateConfidence(structuredData)
            };
        } catch (jsonError) {
            console.error("Receipt Parser: Error parsing JSON response:", jsonError, "Raw text:", responseText);
            throw new Error(`AI analysis failed (JSON Parse). Raw: ${responseText}`);
        }
    }

    /**
     * Generate a meaningful transaction summary
     */
    private generateTransactionSummary(
        aiSummary: string | undefined, 
        items: Array<{ description?: string; name?: string; price: number; quantity: number }>
    ): string {
        const summary = aiSummary?.trim();
        
        if (summary) {
            return summary;
        }

        if (items.length === 1 && (items[0].description || items[0].name)) {
            return items[0].description || items[0].name || '';
        }
        
        if (items.length > 1) {
            return `Items from Receipt (${items.length})`;
        }
        
        return 'Receipt Parsed - Check Details';
    }

    /**
     * Calculate confidence score based on data completeness
     */
    private calculateConfidence(data: RawReceiptData): number {
        let score = 0;
        
        if (data.total_amount !== undefined && data.total_amount > 0) score += 40;
        if (data.transaction_summary?.trim()) score += 30;
        if (data.items && data.items.length > 0) score += 20;
        if (data.items?.some(item => item.price !== undefined)) score += 10;
        
        return Math.min(score, 100);
    }

    /**
     * Convert API errors to user-friendly messages
     */
    private createUserFriendlyError(apiError: any): Error {
        console.error("Receipt Parser: Error calling Gemini API:", apiError);
        
        let userMessage = `Error parsing receipt: ${apiError.message}`;
        
        if (apiError.message?.includes("quota")) {
            userMessage = "Receipt analysis failed: API quota exceeded.";
        } else if (apiError.message?.includes("App Check")) {
            userMessage = "Receipt analysis failed: App verification error.";
        } else if (apiError.message?.includes("specifica")) {
            userMessage = "Receipt analysis failed: AI could not match the required format.";
        } else if (apiError.code?.includes("invalid-argument") || apiError.message?.includes("Invalid JSON payload")) {
            userMessage = "Receipt analysis failed: Invalid data sent to AI.";
        }
        
        return new Error(userMessage);
    }
}
