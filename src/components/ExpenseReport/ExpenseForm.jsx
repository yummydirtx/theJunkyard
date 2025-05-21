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
import ReceiptUpload from './ReceiptUpload';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore } from "firebase/firestore"; 
import FormHeader from './FormHeader';
import ParsedItemsList from './ParsedItemsList';
import { usePendingReceiptManagement } from './hooks/usePendingReceiptManagement';
import { useReceiptProcessor } from './hooks/useReceiptProcessor';

/**
 * A form component for adding new expenses, optionally parsing details from an uploaded receipt using Vertex AI.
 * @param {object} props - Component props.
 * @param {function} props.onAddExpense - Callback function invoked when a new expense is successfully submitted.
 *                                        Receives an object with { description, amount, receiptUri, items }.
 * @param {function} props.onDeleteStorageFile - Callback function to delete a file from storage by its gs:// URI.
 */
export default function ExpenseForm({ onAddExpense, onDeleteStorageFile }) {
    const { app, activeUser } = useAuth();
    const db = getFirestore(app);

    // --- State Variables ---
    // Form input fields
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [receiptGsUri, setReceiptGsUri] = useState(''); // Final URI for submission
    const [items, setItems] = useState([]);
    const [receiptUploadKey, setReceiptUploadKey] = useState(0);

    // UI and process flow control for submission
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(''); // For submission errors or general form errors
    const [info, setInfo] = useState('');   // For submission success messages
    const [isExpanded, setIsExpanded] = useState(true);

    // Ref to prevent cleanup effect during successful submission phase
    const isSubmittingSuccessRef = useRef(false);

    // --- Custom Hooks ---
    const {
        pendingReceiptDocIdRef,
        unsubmittedReceiptUriRef,
        setUnsubmittedReceiptUri: setHookUnsubmittedReceiptUri,
        deletePendingReceiptDoc,
        createPendingReceiptDoc, // Exported from usePendingReceiptManagement
    } = usePendingReceiptManagement(db, activeUser, onDeleteStorageFile, isSubmittingSuccessRef);

    const {
        parsingReceipt,
        parsingError, // Error from parsing process
        parsingInfo,  // Info from parsing process
        handleReceiptUploadAndParse,
    } = useReceiptProcessor(
        app,
        onDeleteStorageFile,
        pendingReceiptDocIdRef,
        unsubmittedReceiptUriRef,
        setHookUnsubmittedReceiptUri,
        createPendingReceiptDoc, // Pass the function directly
        deletePendingReceiptDoc, // Pass the function directly
        setReceiptGsUri, // Callback to set form's receipt URI
        setDescription,  // Callback to set form's description
        setAmount,       // Callback to set form's amount
        setItems         // Callback to set form's items
    );


    // --- Effects ---
    // Reset general info/error messages when the user manually changes description or amount,
    // but only if AI parsing or submission is not currently in progress.
    useEffect(() => {
        if (!parsingReceipt && !isSubmitting) {
            setInfo(''); // Clear general submission info
            setError(''); // Clear general submission error
        }
    }, [description, amount, parsingReceipt, isSubmitting]);

    // Unmount cleanup for pending receipts is now handled by usePendingReceiptManagement hook.

    // handleReceiptUpload and handleParseReceipt are now combined in useReceiptProcessor's handleReceiptUploadAndParse

    /**
     * Handles the final submission. Deletes the pending receipt doc on success.
     */
    const handleAdd = async () => {
        setError('');
        setInfo('');

        const parsedAmount = parseFloat(amount);
        if (!description.trim() || !amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please ensure description and a valid positive amount are entered.');
            return;
        }
        if (parsingReceipt) {
            setError('Please wait for receipt analysis to complete.');
            return;
        }

        setIsSubmitting(true);
        isSubmittingSuccessRef.current = false;

        try {
            const expenseData = {
                description: description.trim(),
                amount: parsedAmount,
                receiptUri: receiptGsUri,
                items: items,
            };

            isSubmittingSuccessRef.current = true; // Mark before async operation that might unmount
            await onAddExpense(expenseData);

            // Clear unsubmitted URI tracking (ref is managed by hook, state by hook)
            if (unsubmittedReceiptUriRef.current) {
                 console.log("Form: Cleared unsubmitted URI ref after successful submission for:", unsubmittedReceiptUriRef.current);
                 unsubmittedReceiptUriRef.current = null;
            }
            setHookUnsubmittedReceiptUri(null); // Update hook's state

            const docIdToDelete = pendingReceiptDocIdRef.current;
            if (docIdToDelete) {
                deletePendingReceiptDoc(docIdToDelete).then(() => {
                    console.log("Form: Pending doc deletion initiated for:", docIdToDelete);
                });
                // pendingReceiptDocIdRef is cleared inside deletePendingReceiptDoc
            }

            setDescription('');
            setAmount('');
            setReceiptGsUri('');
            setItems([]);
            setReceiptUploadKey(prevKey => prevKey + 1);
            setInfo('Expense added successfully!');
            // isSubmittingSuccessRef.current = false; // Reset after all state updates

        } catch (err) {
            // isSubmittingSuccessRef.current = false; // Reset on error
            console.error("Submission error in form:", err);
            setError('Failed to add expense. Please try again.');
            setInfo('');
        } finally {
            isSubmittingSuccessRef.current = false; // Ensure reset in finally
            setIsSubmitting(false);
        }
    };

    /** Toggles the visibility of the main form content area. */
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const isProcessing = parsingReceipt || isSubmitting;

    /**
     * Handles changes within the editable items list.
     */
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        if (field === 'price') {
            const numValue = value === '' ? '' : parseFloat(value);
            if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
                 updatedItems[index] = { ...updatedItems[index], [field]: value === '' ? undefined : numValue };
            } else {
                console.warn("Invalid price input:", value);
                return;
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

    return (
        <Box sx={{ p: 2, border: '1px dashed grey', mb: 3 }}>
            <FormHeader isExpanded={isExpanded} toggleExpand={toggleExpand} />

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <ReceiptUpload
                    key={receiptUploadKey}
                    onUploadComplete={handleReceiptUploadAndParse} // Use the hook's combined function
                    disabled={isProcessing}
                />

                {/* Parsing Info/Error Messages from Hook */}
                {parsingReceipt && parsingInfo && (
                     <Alert severity="info" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                         <CircularProgress size={16} sx={{ mr: 1 }} />
                         {parsingInfo}
                    </Alert>
                 )}
                 {!parsingReceipt && parsingInfo && !parsingError && ( // Successfully parsed
                     <Alert severity="success" sx={{ mt: 1 }}>{parsingInfo}</Alert>
                 )}
                 {parsingError && ( // Error during parsing
                     <Alert severity="error" sx={{ mt: 1 }}>{parsingError}</Alert>
                 )}

                <TextField
                    label="Description"
                    variant="outlined"
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mt: 2, mb: 1 }}
                    disabled={isProcessing}
                    required
                    helperText="Summary of the expense. Will be auto-filled from receipt if possible."
                />

                <ParsedItemsList
                    items={items}
                    onItemChange={handleItemChange}
                    onAddItem={handleAddItem}
                    onRemoveItem={handleRemoveItem}
                    isProcessing={isProcessing}
                />
                {/* Conditional rendering for Add Item button if items list is empty is now inside ParsedItemsList */}


                <TextField
                    label="Amount ($)"
                    variant="outlined"
                    type="number"
                    fullWidth
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isProcessing}
                    required
                    slotProps={{ htmlInput: { step: "0.01", min: "0.01" } }}
                    helperText="Total amount. Will be auto-filled from receipt if possible."
                />

                 {/* General Error Message Area (for submission or other general errors) */}
                {error && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>}
                {/* General Info Message Area (for submission success) */}
                {!parsingReceipt && info && !error && !parsingInfo && ( // Show general info if no parsing messages are active
                    <Alert severity="success" sx={{ mt: 1, mb: 1 }}>{info}</Alert>
                )}


                <Button
                    variant="contained"
                    onClick={handleAdd}
                    sx={{ mt: 2 }}
                    disabled={isProcessing || !amount || !description.trim()}
                >
                    {/* Show spinner during submission, otherwise show text */}
                    {isSubmitting ? <CircularProgress size={24} /> : 'Add Expense'}
                </Button>
            </Collapse>
        </Box>
    );
}