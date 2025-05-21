// Copyright (c) 2025 Alex Frutkin
// ... (license details) ...

import { useState } from 'react';
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

// Define the Schema for Structured Output from Vertex AI
const receiptSchema = {
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
};

export function useReceiptProcessor(
    app, // Firebase app instance
    onDeleteStorageFile,
    // From usePendingReceiptManagement hook
    pendingReceiptDocIdRef,
    unsubmittedReceiptUriRef,
    hookSetUnsubmittedReceiptUri, // Renamed to avoid conflict
    createPendingReceiptDoc,
    deletePendingReceiptDoc,
    // Callbacks to update ExpenseForm state
    setFormReceiptGsUri, // Renamed
    setFormDescription,  // Renamed
    setFormAmount,       // Renamed
    setFormItems         // Renamed
) {
    const [parsingReceipt, setParsingReceipt] = useState(false);
    const [parsingError, setParsingError] = useState('');
    const [parsingInfo, setParsingInfo] = useState('');

    const handleReceiptUploadAndParse = async (newGsUri, mimeType) => {
        // 1. Delete previous unsubmitted receipt file AND pending doc
        const oldUnsubmittedUri = unsubmittedReceiptUriRef.current;
        const oldPendingDocId = pendingReceiptDocIdRef.current;

        if (oldUnsubmittedUri && oldUnsubmittedUri !== newGsUri && onDeleteStorageFile) {
            console.log("Processor: New receipt, deleting previous unsubmitted file:", oldUnsubmittedUri);
            try {
                await onDeleteStorageFile(oldUnsubmittedUri);
            } catch (delError) {
                console.error("Processor: Failed to delete previous unsubmitted receipt file:", delError);
            }
        }
        if (oldPendingDocId) {
            console.log("Processor: New receipt, deleting previous pending doc:", oldPendingDocId);
            await deletePendingReceiptDoc(oldPendingDocId);
        }
        unsubmittedReceiptUriRef.current = null;
        // pendingReceiptDocIdRef is cleared by deletePendingReceiptDoc

        // 2. Reset form fields (via callbacks) & internal hook state
        setFormReceiptGsUri('');
        setFormAmount('');
        setFormDescription('');
        setFormItems([]);
        setParsingError('');
        setParsingInfo('');
        hookSetUnsubmittedReceiptUri(null);


        if (newGsUri && mimeType && app) {
            setFormReceiptGsUri(newGsUri); // Set this early for the form, might be overwritten by parsing
            hookSetUnsubmittedReceiptUri(newGsUri);
            unsubmittedReceiptUriRef.current = newGsUri;

            // 3. Create new pending receipt document
            try {
                await createPendingReceiptDoc(newGsUri);
            } catch (error) {
                console.error("Processor: Failed to create pending receipt document:", error);
                setParsingError("Failed to track pending receipt. Please try uploading again.");
                if (onDeleteStorageFile) await onDeleteStorageFile(newGsUri);
                unsubmittedReceiptUriRef.current = null;
                hookSetUnsubmittedReceiptUri(null);
                setFormReceiptGsUri('');
                return;
            }

            // 4. Start parsing
            await parseReceipt(newGsUri, mimeType);
        } else {
            unsubmittedReceiptUriRef.current = null;
            hookSetUnsubmittedReceiptUri(null);
            if (!app) {
                setParsingError("Cannot process upload: Firebase app unavailable.");
            }
        }
    };

    const parseReceipt = async (gsUri, mimeType) => {
        if (!gsUri || !mimeType || !app) {
            setParsingError("Missing file URI, MIME type, or Firebase app instance for parsing.");
            return;
        }

        setParsingReceipt(true);
        setParsingError('');
        setParsingInfo('Analyzing receipt...');
        setFormItems([]); // Clear previous items

        try {
            const vertexAI = getVertexAI(app);
            const generativeModel = getGenerativeModel(vertexAI, {
                model: "gemini-2.0-flash",
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: receiptSchema,
                },
            });

            const prompt = 'Extract the total amount, a brief transaction summary (like "Groceries at Store" or "Gas at Station"), and item descriptions/prices from this receipt image/PDF. Provide the output in the specified JSON format.';
            const requestPayload = {
                contents: [{ role: 'user', parts: [{ fileData: { mimeType, fileUri: gsUri } }, { text: prompt }] }]
            };

            console.log("Processor: Sending request to Gemini:", JSON.stringify(requestPayload, null, 2));
            const result = await generativeModel.generateContent(requestPayload);
            const response = result.response;
            console.log("Processor: Raw Gemini Response Text:", response.text());

            try {
                const structuredData = JSON.parse(response.text());
                console.log('Processor: Parsed Data:', structuredData);

                setFormAmount(structuredData.total_amount !== undefined ? structuredData.total_amount.toString() : '');
                const parsedItems = structuredData.items || [];
                setFormItems(parsedItems);

                let generatedDescription = structuredData.transaction_summary?.trim() || '';
                if (!generatedDescription) {
                    if (parsedItems.length === 1 && parsedItems[0].description) {
                        generatedDescription = parsedItems[0].description;
                    } else if (parsedItems.length > 1) {
                        generatedDescription = `Items from Receipt (${parsedItems.length})`;
                    } else {
                        generatedDescription = 'Receipt Parsed - Check Details';
                    }
                }
                setFormDescription(generatedDescription);
                setParsingInfo('Receipt analysis complete. Please review fields.');
                // Important: The gsUri is now considered "processed" for this expense,
                // so we ensure the form's receiptGsUri is set.
                setFormReceiptGsUri(gsUri);

            } catch (jsonError) {
                console.error("Processor: Error parsing JSON response:", jsonError, "Raw text:", response.text());
                setParsingError(`AI analysis failed (JSON Parse). Raw: ${response.text()}`);
                setParsingInfo('');
                setFormItems([]);
            }
        } catch (apiError) {
            console.error("Processor: Error calling Gemini API:", apiError);
            let userMessage = `Error parsing receipt: ${apiError.message}`;
            if (apiError.message?.includes("quota")) userMessage = "Receipt analysis failed: API quota exceeded.";
            else if (apiError.message?.includes("App Check")) userMessage = "Receipt analysis failed: App verification error.";
            else if (apiError.message?.includes(" specifica")) userMessage = "Receipt analysis failed: AI could not match the required format.";
            else if (apiError.code?.includes("invalid-argument") || apiError.message?.includes("Invalid JSON payload")) userMessage = "Receipt analysis failed: Invalid data sent to AI.";
            
            setParsingError(userMessage);
            setParsingInfo('');
            setFormItems([]);

            const docIdToDelete = pendingReceiptDocIdRef.current;
            if (gsUri && onDeleteStorageFile) {
                console.log("Processor: Parsing failed, attempting to delete uploaded receipt file:", gsUri);
                await onDeleteStorageFile(gsUri); // No need to clear unsubmittedReceiptUriRef here, as it's the one that failed
            }
            if (docIdToDelete) {
                console.log("Processor: Parsing failed, attempting to delete pending receipt doc:", docIdToDelete);
                await deletePendingReceiptDoc(docIdToDelete);
            }
            // Clear tracking refs/state if parsing fails and file is deleted
            unsubmittedReceiptUriRef.current = null; 
            hookSetUnsubmittedReceiptUri(null);
            setFormReceiptGsUri(''); // Clear the form's URI as it's no longer valid

        } finally {
            setParsingReceipt(false);
        }
    };

    return { parsingReceipt, parsingError, parsingInfo, handleReceiptUploadAndParse };
}
