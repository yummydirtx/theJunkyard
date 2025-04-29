// src/components/ExpenseReport/ExpenseForm.jsx

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
 *                                        Receives an object with { description, amount, receiptUri, items }. // Added items
 */
export default function ExpenseForm({ onAddExpense }) {
    const { app } = useAuth(); // Get Firebase app instance from authentication context

    // --- State Variables ---
    // Form input fields
    const [description, setDescription] = useState(''); // Expense description
    const [amount, setAmount] = useState(''); // Expense amount (as string for input control)
    const [receiptGsUri, setReceiptGsUri] = useState(''); // Google Cloud Storage URI of the uploaded receipt (e.g., gs://bucket/path/to/file)
    const [items, setItems] = useState([]); // State to hold parsed items from AI [{description: string, price?: number}]

    // UI and process flow control
    const [isSubmitting, setIsSubmitting] = useState(false); // True when the form is being submitted to the parent
    const [parsingReceipt, setParsingReceipt] = useState(false); // True when Vertex AI is analyzing the receipt
    const [error, setError] = useState(''); // Stores error messages for display
    const [info, setInfo] = useState(''); // Stores informational messages (e.g., "Parsing...", "Success!")
    const [isExpanded, setIsExpanded] = useState(true); // Controls the collapsible section of the form
    const [receiptUploadKey, setReceiptUploadKey] = useState(0); // Key to force re-render ReceiptUpload

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


    /**
     * Handles the completion of a receipt upload from the ReceiptUpload component.
     * Clears previous form data related to receipts and triggers AI parsing.
     * @param {string} gsUri - The Google Cloud Storage URI of the uploaded file.
     * @param {string} mimeType - The MIME type of the uploaded file (e.g., 'image/jpeg', 'application/pdf').
     */
    const handleReceiptUpload = (gsUri, mimeType) => {
        // Reset fields related to the previous receipt/parsing attempt
        setReceiptGsUri('');
        setAmount('');
        setDescription('');
        setItems([]); // Clear previous items
        setError('');
        setInfo('');

        if (gsUri && mimeType) {
            setReceiptGsUri(gsUri); // Store the new receipt URI
            // Automatically start parsing the newly uploaded receipt
            handleParseReceipt(gsUri, mimeType);
        }
    };

    /**
     * Sends the uploaded receipt (via its gs:// URI) to Vertex AI Gemini model for analysis.
     * Uses the predefined `receiptSchema` to request structured JSON output.
     * Updates form fields (amount, description, items) based on the parsed data.
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
        } finally {
            setParsingReceipt(false); // Indicate that parsing has finished
             // Note: Info message is intentionally kept if parsing was successful,
             // but cleared if an error occurred in the try or catch blocks above.
        }
    };


    /**
     * Handles the final submission of the expense form.
     * Performs basic validation, calls the `onAddExpense` prop, and resets the form on success.
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

        setIsSubmitting(true); // Indicate submission is in progress, disable form elements

        try {
            // Call the parent component's function to handle adding the expense data
            await onAddExpense({
                description: description.trim(), // Send trimmed description (user might have edited it)
                amount: parsedAmount,            // Send parsed numerical amount
                receiptUri: receiptGsUri,        // Send the gs:// URI of the receipt (if any)
                items: items,                    // Send the parsed items array
            });

            // --- Reset Form on Successful Submission ---
            setDescription('');
            setAmount('');
            setReceiptGsUri('');
            setItems([]); // Clear items
            // Increment the key to reset the ReceiptUpload component
            setReceiptUploadKey(prevKey => prevKey + 1);
            setInfo('Expense added successfully!'); // Provide success feedback
             // Optionally collapse the form after successful addition:
             // setIsExpanded(false);

        } catch (err) {
            // Handle errors that occur during the call to onAddExpense (e.g., backend issues)
            console.error("Submission error in form:", err);
            setError('Failed to add expense. Please try again.');
            setInfo(''); // Clear info message on error
        } finally {
            setIsSubmitting(false); // Indicate submission process is complete
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


    // ... (handleReceiptUpload, handleParseReceipt, handleAdd, toggleExpand, isProcessing) ...

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
                                    <ListItem disableGutters sx={{ py: 0.5, pr: 0 }}> {/* Remove right padding */}
                                        <Grid container spacing={1} alignItems="center">
                                            {/* Adjust grid sizes to make space for remove button */}
                                            <Grid item xs={7}>
                                                <TextField
                                                    label={`Item ${index + 1} Desc.`}
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    value={item.description || ''}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    disabled={isProcessing} // Disable while submitting
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <TextField
                                                    label="Price"
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    type="number" // Use number type
                                                    value={item.price !== undefined ? item.price.toString() : ''} // Handle undefined/number for input value
                                                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                    disabled={isProcessing} // Disable while submitting
                                                    inputProps={{ step: "0.01", min: "0" }} // Allow decimals, non-negative
                                                    InputProps={{ // Add '$' adornment
                                                        startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                                                    }}
                                                />
                                            </Grid>
                                            {/* Remove Button */}
                                            <Grid item xs={1} sx={{ textAlign: 'right', pl: 0 }}>
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
                                        </Grid>
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