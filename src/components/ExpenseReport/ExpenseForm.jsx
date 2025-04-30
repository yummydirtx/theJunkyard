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

import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ReceiptUpload from './ReceiptUpload'; // Component for handling file uploads
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Alert from '@mui/material/Alert'; // For displaying errors/info messages
import List from '@mui/material/List'; // For displaying items
import ListItem from '@mui/material/ListItem'; // For displaying items
import Divider from '@mui/material/Divider'; // For displaying items
import Grid from '@mui/material/Grid'; // For layout of item fields
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Icon for Add Item
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'; // Icon for Remove Item

// Import Firebase/Vertex AI functions and Auth context
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";
import { useAuth } from '../../contexts/AuthContext';
// Import Firestore functions for pending receipts
import { getFirestore, collection, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

// --- Define the Schema for Structured Output from Vertex AI ---
// This schema guides the AI to extract specific information from the receipt.
const receiptSchema = {
    type: 'object',
    properties: {
        total_amount: {
            type: 'number',
            description: 'The final total amount paid on the receipt, including tax and tips. Extract only the numerical value.'
        },
        transaction_summary: { // Added summary field
            type: 'string',
            description: 'A brief summary of the transaction (e.g., "Groceries at Safeway", "Gas at Shell", "Dinner at Restaurant Name"). Identify the merchant and general category if possible.'
        },
        items: {
            type: 'array',
            description: 'List of items purchased. Extract the description and price (if available) for each item.', // Updated description
            items: {
                type: 'object',
                properties: {
                    description: {
                        type: 'string',
                        description: 'Description of the purchased item.'
                    },
                    price: { // Added optional price
                        type: 'number',
                        description: 'Price of the item, if clearly identifiable. Extract only the numerical value.'
                    }
                },
                required: ['description'] // Only description is required per item
            }
        }
    },
    // Only total_amount is strictly required now, summary and items are preferred.
    required: ['total_amount']
};
// --- End Schema Definition ---

/**
 * A form component for adding new expenses, optionally parsing details from an uploaded receipt using Vertex AI.
 * @param {object} props - Component props.
 * @param {function} props.onAddExpense - Callback function invoked when a new expense is successfully submitted.
 *                                        Receives an object with { description, amount, receiptUri, items }.
 * @param {function} props.onDeleteStorageFile - Callback function to delete a file from storage by its gs:// URI.
 */
export default function ExpenseForm({ onAddExpense, onDeleteStorageFile }) {
    const { app, activeUser } = useAuth(); // Get Firebase app instance and user
    const db = getFirestore(app); // Initialize Firestore

    // --- State Variables ---
    // Form input fields
    const [description, setDescription] = useState(''); // Expense description
    const [amount, setAmount] = useState(''); // Expense amount (as string for input control)
    const [receiptGsUri, setReceiptGsUri] = useState(''); // Google Cloud Storage URI of the uploaded receipt (e.g., gs://bucket/path/to/file)
    const [items, setItems] = useState([]); // State to hold parsed items from AI [{description: string, price?: number}]
    // State and Ref to track the URI of the receipt uploaded but not yet submitted
    const [unsubmittedReceiptUri, setUnsubmittedReceiptUri] = useState(null);
    const [receiptUploadKey, setReceiptUploadKey] = useState(0); // Key to force re-render ReceiptUpload

    // --- Refs ---
    const unsubmittedReceiptUriRef = useRef(null);
    const pendingReceiptDocIdRef = useRef(null);
    // Ref to prevent cleanup effect during successful submission phase
    const isSubmittingSuccessRef = useRef(false);

    // UI and process flow control
    const [isSubmitting, setIsSubmitting] = useState(false); // True when the form is being submitted to the parent
    const [parsingReceipt, setParsingReceipt] = useState(false); // True when Vertex AI is analyzing the receipt
    const [error, setError] = useState(''); // Stores error messages for display
    const [info, setInfo] = useState(''); // Stores informational messages (e.g., "Parsing...", "Success!")
    const [isExpanded, setIsExpanded] = useState(true); // Controls the collapsible section of the form

    // --- Effects ---
    // Reset info/error messages when the user manually changes description or amount,
    // but only if AI parsing is not currently in progress.
    useEffect(() => {
        if (!parsingReceipt) {
            setInfo('');
            setError('');
            // Note: We don't clear 'items' here, as they are linked to the receipt parsing.
            // They get cleared when a new receipt is uploaded or form is submitted.
        }
    }, [description, amount, parsingReceipt]); // Dependencies: run effect when these values change

    // Helper function to delete pending receipt Firestore document
    const deletePendingReceiptDoc = async (docId) => {
        if (!docId || !db || !activeUser) return;
        console.log("Deleting pending receipt document:", docId);
        try {
            await deleteDoc(doc(db, "pendingReceipts", docId));
            pendingReceiptDocIdRef.current = null; // Clear ref after deletion
        } catch (error) {
            console.error("Error deleting pending receipt document:", docId, error);
            // Log error, but don't necessarily block UI
        }
    };

    // Effect to clean up unsubmitted receipt and pending doc on component unmount
    useEffect(() => {
        // Return the cleanup function
        return () => {
            // --- Check if cleanup should be skipped ---
            if (isSubmittingSuccessRef.current) {
                console.log("ExpenseForm cleanup skipped due to successful submission in progress.");
                return; // Don't run cleanup if submission just succeeded
            }
            // --- End Check ---

            const uriToDelete = unsubmittedReceiptUriRef.current;
            const docIdToDelete = pendingReceiptDocIdRef.current;

            // Delete file from Storage
            if (uriToDelete && onDeleteStorageFile) {
                console.log("ExpenseForm unmounting/cleaning up unsubmitted receipt file:", uriToDelete);
                onDeleteStorageFile(uriToDelete); // Fire-and-forget is okay here
            }
            // Delete pending document from Firestore
            if (docIdToDelete) {
                 console.log("ExpenseForm unmounting/cleaning up pending receipt doc:", docIdToDelete);
                 deletePendingReceiptDoc(docIdToDelete); // Fire-and-forget
            }
            // Clear refs on unmount (only if not skipped)
            unsubmittedReceiptUriRef.current = null;
            pendingReceiptDocIdRef.current = null;
        };
        // Dependencies remain the same
    }, [onDeleteStorageFile, db, activeUser]);


    /**
     * Handles the completion of a receipt upload from the ReceiptUpload component.
     * Clears previous form data, deletes old unsubmitted files/docs, creates a new pending doc, and triggers parsing.
     * @param {string} newGsUri - The Google Cloud Storage URI of the newly uploaded file.
     * @param {string} mimeType - The MIME type of the uploaded file.
     */
    const handleReceiptUpload = async (newGsUri, mimeType) => {
        // --- Delete previous unsubmitted receipt file AND pending doc ---
        const oldUnsubmittedUri = unsubmittedReceiptUriRef.current;
        const oldPendingDocId = pendingReceiptDocIdRef.current;

        if (oldUnsubmittedUri && oldUnsubmittedUri !== newGsUri && onDeleteStorageFile) {
            console.log("New receipt uploaded, deleting previous unsubmitted file:", oldUnsubmittedUri);
            try {
                await onDeleteStorageFile(oldUnsubmittedUri); // Wait for deletion attempt
            } catch (delError) {
                console.error("Failed to delete previous unsubmitted receipt file:", delError);
            }
        }
        if (oldPendingDocId) {
             console.log("New receipt uploaded, deleting previous pending doc:", oldPendingDocId);
             await deletePendingReceiptDoc(oldPendingDocId); // Wait for deletion attempt
        }
        // Clear refs immediately after attempting deletion
        unsubmittedReceiptUriRef.current = null;
        pendingReceiptDocIdRef.current = null;
        setUnsubmittedReceiptUri(null);
        // --- End Deletion ---

        // Reset form fields
        setReceiptGsUri('');
        setAmount('');
        setDescription('');
        setItems([]);
        setError('');
        setInfo('');

        if (newGsUri && mimeType && activeUser && db) {
            setReceiptGsUri(newGsUri);
            setUnsubmittedReceiptUri(newGsUri);
            unsubmittedReceiptUriRef.current = newGsUri;

            // --- Create new pending receipt document ---
            try {
                console.log("Creating pending receipt document for:", newGsUri);
                const pendingData = {
                    userId: activeUser.uid,
                    gsUri: newGsUri,
                    uploadTimestamp: serverTimestamp()
                };
                const docRef = await addDoc(collection(db, "pendingReceipts"), pendingData);
                pendingReceiptDocIdRef.current = docRef.id; // Store the new pending doc ID
                console.log("Pending receipt document created:", docRef.id);
            } catch (error) {
                console.error("Failed to create pending receipt document:", error);
                setError("Failed to track pending receipt. Please try uploading again.");
                // If creating the pending doc fails, we should probably delete the uploaded file
                if (onDeleteStorageFile) {
                    await onDeleteStorageFile(newGsUri);
                }
                unsubmittedReceiptUriRef.current = null;
                setUnsubmittedReceiptUri(null);
                setReceiptGsUri('');
                return; // Stop processing
            }
            // --- End Create Pending Doc ---

            // Automatically start parsing the newly uploaded receipt
            handleParseReceipt(newGsUri, mimeType);
        } else {
             // Clear refs if upload failed earlier or user/db not available
             unsubmittedReceiptUriRef.current = null;
             pendingReceiptDocIdRef.current = null;
             setUnsubmittedReceiptUri(null);
             if (!activeUser || !db) {
                 setError("Cannot process upload: User or database unavailable.");
             }
        }
    };

    /**
     * Sends the uploaded receipt for analysis. Deletes the file and pending doc if parsing fails.
     * @param {string} gsUri - The Google Cloud Storage URI of the file to parse.
     * @param {string} mimeType - The MIME type of the file.
     */
    const handleParseReceipt = async (gsUri, mimeType) => {
        // Basic validation before calling the API
        if (!gsUri || !mimeType || !app) {
            setError("Missing file URI, MIME type, or Firebase app instance.");
            return;
        }

        setParsingReceipt(true); // Indicate that parsing has started
        setError(''); // Clear previous errors
        setInfo('Analyzing receipt...'); // Inform the user
        setItems([]); // Clear previous items before parsing new ones

        try {
            // Initialize Vertex AI service
            const vertexAI = getVertexAI(app);

            // Configure the generative model
            const generativeModel = getGenerativeModel(vertexAI, {
                model: "gemini-2.0-flash", // Specify the model to use
                generationConfig: {
                    responseMimeType: 'application/json', // Request JSON output
                    responseSchema: receiptSchema, // Enforce the defined schema
                },
                // Optional: Add safetySettings if needed (e.g., to block harmful content)
            });

            // Define the prompt for the AI - Updated to ask for summary
            const prompt = 'Extract the total amount, a brief transaction summary (like "Groceries at Store" or "Gas at Station"), and item descriptions/prices from this receipt image/PDF. Provide the output in the specified JSON format.';

            // Construct the request payload for the Gemini API
            // It requires a 'contents' array, where each element represents a turn in the conversation.
            // Each turn has 'parts', which can be text or file data.
            const requestPayload = {
                contents: [ // Array of Content objects (usually one for a single prompt)
                    {
                       role: 'user', // Role of the sender (user in this case)
                       parts: [ // Array of Part objects making up the content
                           { fileData: { mimeType: mimeType, fileUri: gsUri } }, // Part 1: The receipt file data (referenced by URI)
                           { text: prompt }                                      // Part 2: The text prompt instructing the AI
                       ]
                    }
                ]
            };

            console.log("Sending request to Gemini:", JSON.stringify(requestPayload, null, 2));

            // Call the Vertex AI API to generate content based on the prompt and file
            const result = await generativeModel.generateContent(requestPayload);
            const response = result.response; // Access the response object

            console.log("Raw Gemini Response Text:", response.text()); // Log the raw text response for debugging

            // Attempt to parse the JSON response from the AI
            try {
                const structuredData = JSON.parse(response.text());
                console.log('Parsed Data:', structuredData); // Log the successfully parsed data

                // --- Update Form Fields based on parsed data ---
                // Set amount, converting the number to a string for the input field
                setAmount(structuredData.total_amount !== undefined ? structuredData.total_amount.toString() : '');

                // Set items state
                const parsedItems = structuredData.items || [];
                setItems(parsedItems);

                // Set main description - Prioritize summary, then fallback
                let generatedDescription = structuredData.transaction_summary?.trim() || ''; // Use summary if available

                if (!generatedDescription) { // Fallback logic if no summary provided
                    if (parsedItems.length === 1 && parsedItems[0].description) {
                        generatedDescription = parsedItems[0].description; // Use single item description
                    } else if (parsedItems.length > 1) {
                        generatedDescription = `Items from Receipt (${parsedItems.length})`; // Summary for multiple items
                    } else {
                         generatedDescription = 'Receipt Parsed - Check Details'; // Generic fallback
                    }
                }
                setDescription(generatedDescription);

                setInfo('Receipt analysis complete. Please review fields.'); // Update info message on success

            } catch (jsonError) {
                // Handle errors during JSON parsing (e.g., AI response wasn't valid JSON)
                console.error("Error parsing JSON response:", jsonError, "Raw text:", response.text());
                setError(`AI analysis failed (JSON Parse). Raw: ${response.text()}`);
                setInfo(''); // Clear info message on error
                setItems([]); // Clear items on JSON parse error
            }

        } catch (apiError) {
            // Handle errors during the API call itself (e.g., network issues, quota exceeded, invalid arguments)
            console.error("Error calling Gemini API:", apiError);
             // Provide user-friendly error messages based on common API error types
             let userMessage = `Error parsing receipt: ${apiError.message}`;
             if (apiError.message?.includes("quota")) {
                 userMessage = "Receipt analysis failed: API quota exceeded.";
             } else if (apiError.message?.includes("App Check")) {
                 userMessage = "Receipt analysis failed: App verification error.";
             } else if (apiError.message?.includes(" specifica")) { // Heuristic check for schema validation issues
                 userMessage = "Receipt analysis failed: AI could not match the required format.";
             } else if (apiError.code?.includes("invalid-argument") || apiError.message?.includes("Invalid JSON payload")) {
                 userMessage = "Receipt analysis failed: Invalid data sent to AI."; // More generic message for bad payload
             }
            setError(userMessage); // Display the user-friendly error
            setInfo(''); // Clear info message on error
            setItems([]); // Clear items on API error

            // --- Attempt to delete the failed receipt file AND pending doc ---
            const docIdToDelete = pendingReceiptDocIdRef.current;
            if (gsUri && onDeleteStorageFile) {
                console.log("Parsing failed, attempting to delete uploaded receipt file:", gsUri);
                await onDeleteStorageFile(gsUri);
            }
            if (docIdToDelete) {
                 console.log("Parsing failed, attempting to delete pending receipt doc:", docIdToDelete);
                 await deletePendingReceiptDoc(docIdToDelete); // Uses the helper
            }
            // Clear tracking refs/state
            unsubmittedReceiptUriRef.current = null;
            pendingReceiptDocIdRef.current = null; // Already cleared in deletePendingReceiptDoc
            setUnsubmittedReceiptUri(null);
            // --- End Deletion on Failure ---
        } finally {
            setParsingReceipt(false); // Indicate that parsing has finished
             // Note: Info message is intentionally kept if parsing was successful,
             // but cleared if an error occurred in the try or catch blocks above.
        }
    };


    /**
     * Handles the final submission. Deletes the pending receipt doc on success.
     */
    const handleAdd = async () => {
        setError(''); // Clear previous submission errors
        setInfo(''); // Clear previous info messages

        // --- Basic Client-Side Validation ---
        const parsedAmount = parseFloat(amount); // Convert amount string to number for validation
        if (!description.trim() || !amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please ensure description and a valid positive amount are entered.');
            return; // Stop submission if validation fails
        }
        // Prevent submission if AI parsing is still in progress
        if (parsingReceipt) {
            setError('Please wait for receipt analysis to complete.');
            return;
        }
        // --- End Validation ---

        setIsSubmitting(true);
        isSubmittingSuccessRef.current = false; // Ensure it's false initially

        try {
            // Prepare data (ensure items are included)
            // Status and denialReason are NOT included here; they are added by the parent.
             const expenseData = {
                description: description.trim(),
                amount: parsedAmount,
                receiptUri: receiptGsUri, // Use the URI stored in the main state
                items: items,
            };

            // --- Mark submission success phase ---
            isSubmittingSuccessRef.current = true;
            // --- End Mark ---

            await onAddExpense(expenseData); // Wait for the parent to confirm addition

            // --- Clear Unsubmitted Receipt Tracking *IMMEDIATELY* after successful submission ---
            // This prevents the unmount/cleanup effect from deleting the submitted file
            const currentUnsubmittedUri = unsubmittedReceiptUriRef.current; // Store temporarily if needed for logging
            unsubmittedReceiptUriRef.current = null;
            setUnsubmittedReceiptUri(null);
            console.log("Cleared unsubmitted URI ref after successful submission for:", currentUnsubmittedUri);
            // --- End Clearing URI Tracking ---

            // --- Delete Pending Receipt Doc on Success ---
            const docIdToDelete = pendingReceiptDocIdRef.current;
            if (docIdToDelete) {
                // No need to await this necessarily, can run in background
                deletePendingReceiptDoc(docIdToDelete).then(() => {
                     // pendingReceiptDocIdRef is cleared inside deletePendingReceiptDoc
                     console.log("Pending doc deletion initiated for:", docIdToDelete);
                });
                // Clear the ref immediately after initiating deletion
                pendingReceiptDocIdRef.current = null;
            }
            // --- End Deletion ---


            // --- Reset Form ---
            setDescription('');
            setAmount('');
            setReceiptGsUri('');
            setItems([]);
            // Re-introduce key update to force ReceiptUpload remount/reset
            setReceiptUploadKey(prevKey => prevKey + 1);
            setInfo('Expense added successfully!');

            // --- Unmark submission success phase *after* all state resets ---
            isSubmittingSuccessRef.current = false;
            // --- End Unmark ---

        } catch (err) {
            // --- Ensure flag is reset on error too ---
            isSubmittingSuccessRef.current = false;
            // --- End Reset ---
            console.error("Submission error in form:", err);
            setError('Failed to add expense. Please try again.');
            setInfo('');
        } finally {
            setIsSubmitting(false);
        }
    };

    /** Toggles the visibility of the main form content area. */
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // Determine if any background processing (parsing or submitting) is happening.
    // Used to disable form elements during these operations.
    const isProcessing = parsingReceipt || isSubmitting;

    /**
     * Handles changes within the editable items list.
     * @param {number} index - The index of the item being changed.
     * @param {string} field - The field being changed ('description' or 'price').
     * @param {string} value - The new value from the input field.
     */
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        if (field === 'price') {
            // Allow empty string or valid number for price
            const numValue = value === '' ? '' : parseFloat(value);
            if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
                 updatedItems[index] = { ...updatedItems[index], [field]: value === '' ? undefined : numValue }; // Store as number or undefined
            } else {
                // Optionally provide feedback or prevent invalid input further
                console.warn("Invalid price input:", value);
                return; // Don't update state if invalid number format (excluding empty)
            }
        } else {
            updatedItems[index] = { ...updatedItems[index], [field]: value };
        }
        setItems(updatedItems);
    };

    /**
     * Adds a new, empty item to the items list.
     */
    const handleAddItem = () => {
        setItems([...items, { description: '', price: undefined }]);
    };

    /**
     * Removes an item from the list by its index.
     * @param {number} indexToRemove - The index of the item to remove.
     */
    const handleRemoveItem = (indexToRemove) => {
        setItems(items.filter((_, index) => index !== indexToRemove));
    };


    // ... (handleReceiptUpload, handleParseReceipt, toggleExpand, isProcessing) ...

    return (
        <Box sx={{ p: 2, border: '1px dashed grey', mb: 3 }}>
            {/* Header section for the form, clickable to toggle expansion */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={toggleExpand}>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>Add New Expense</Typography>
                {/* Expand/Collapse Icon Button */}
                <IconButton onClick={(e) => { e.stopPropagation(); toggleExpand(); }} size="small"> {/* Stop propagation to prevent Box onClick */}
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            {/* Collapsible content area */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                {/* Receipt Upload Component */}
                <ReceiptUpload
                    key={receiptUploadKey} // Add the key prop here
                    onUploadComplete={handleReceiptUpload} // Callback when upload finishes
                    disabled={isProcessing} // Disable upload if parsing or submitting
                />

                 {/* Informational message displayed during AI parsing */}
                {parsingReceipt && info && (
                     <Alert severity="info" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                         <CircularProgress size={16} sx={{ mr: 1 }} /> {/* Loading spinner */}
                         {info} {/* Message like "Analyzing receipt..." */}
                    </Alert>
                 )}
                 {/* Success/Info message displayed after successful parsing or submission */}
                 {!parsingReceipt && info && !error && (
                     <Alert severity="success" sx={{ mt: 1 }}>{info}</Alert>
                 )}


                {/* Description Input Field */}
                <TextField
                    label="Description"
                    variant="outlined"
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mt: 2, mb: 1 }} // Reduced bottom margin
                    disabled={isProcessing} // Disable while processing
                    required // HTML5 required attribute
                    helperText="Summary of the expense. Will be auto-filled from receipt if possible."
                />

                {/* Display Parsed Items (Editable) */}
                {items.length > 0 && !parsingReceipt && (
                    <Box sx={{ my: 1, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="caption" display="block" gutterBottom sx={{ color: 'text.secondary', mb: 1 }}>
                            Parsed Items (Editable):
                        </Typography>
                        <List dense disablePadding>
                            {items.map((item, index) => (
                                <React.Fragment key={index}>
                                    <ListItem disableGutters sx={{ py: 0.5, pr: 0 }}>
                                        {/* Grid v2: container prop remains */}
                                        <Grid container spacing={1} alignItems="center">
                                            {/* Grid v2: Replace 'xs' with 'size' */}
                                            <Grid size={7}>
                                                <TextField
                                                    label={`Item ${index + 1} Desc.`}
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    value={item.description || ''}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    disabled={isProcessing}
                                                />
                                            </Grid>
                                            {/* Grid v2: Replace 'xs' with 'size' */}
                                            <Grid size={4}>
                                                <TextField
                                                    label="Price"
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    type="number"
                                                    value={item.price !== undefined ? item.price.toString() : ''}
                                                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                    disabled={isProcessing}
                                                    inputProps={{ step: "0.01", min: "0" }}
                                                    InputProps={{
                                                        startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                                                    }}
                                                />
                                            </Grid>
                                            {/* Grid v2: Replace 'xs' with 'size' */}
                                            <Grid size={1} sx={{ textAlign: 'right', pl: 0 }}>
                                                <IconButton
                                                    aria-label="remove item"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={isProcessing}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <RemoveCircleOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </Grid>
                                        </Grid> {/* End Grid container */}
                                    </ListItem>
                                    {index < items.length - 1 && <Divider component="li" light sx={{ my: 0.5 }} />}
                                </React.Fragment>
                            ))}
                        </List>
                        {/* Add Item Button */}
                        <Button
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={handleAddItem}
                            size="small"
                            sx={{ mt: 1 }}
                            disabled={isProcessing}
                        >
                            Add Item
                        </Button>
                         <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mt: 1 }}>
                            Note: Editing item prices does not automatically update the total amount field below.
                        </Typography>
                    </Box>
                )}
                {/* Show Add Item button even if list is initially empty (after parsing or if no receipt) */}
                 {items.length === 0 && !parsingReceipt && (
                     <Button
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleAddItem}
                        size="small"
                        sx={{ mt: 1, mb: 1 }}
                        disabled={isProcessing}
                    >
                        Add Expense Item 
                    </Button>
                 )}


                {/* Amount Input Field */}
                <TextField
                    label="Amount ($)"
                    variant="outlined"
                    type="number" // Use number type for better input control (e.g., numeric keyboard on mobile)
                    fullWidth
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isProcessing} // Disable while processing
                    required // HTML5 required attribute
                    inputProps={{ step: "0.01", min: "0.01" }} // Allow decimals, enforce positive value
                    helperText="Total amount. Will be auto-filled from receipt if possible."
                />

                 {/* General Error Message Area */}
                {error && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>}

                {/* Submit Button */}
                <Button
                    variant="contained"
                    onClick={handleAdd}
                    sx={{ mt: 2 }}
                    // Disable button if processing, or if required fields are empty/invalid
                    disabled={isProcessing || !amount || !description.trim()}
                >
                    {/* Show spinner during submission, otherwise show text */}
                    {isSubmitting ? <CircularProgress size={24} /> : 'Add Expense'}
                </Button>
            </Collapse>
        </Box>
    );
}