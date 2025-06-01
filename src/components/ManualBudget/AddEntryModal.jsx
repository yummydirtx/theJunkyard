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
    Box,
    Button,
    Fade,
    Modal,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRef, useState } from 'react';
import DateInput from './shared/DateInput';
import MoneyInput from './shared/MoneyInput';
import { parseAmount } from './utils/budgetUtils';

/**
 * Helper function to get a date string in YYYY-MM-DD format from a Date object,
 * respecting the local timezone.
 * @param {Date} [date=new Date()] - The date object to format. Defaults to the current date.
 * @returns {string} The formatted date string.
 */
const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * AddEntryModal provides a form for users to add a new spending entry to a selected category.
 * It allows input for amount, date, and an optional description.
 * On submission, it adds the entry to Firestore and updates category/month totals.
 * @param {object} props - The component's props.
 * @param {boolean} props.open - Controls the visibility of the modal.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {object} props.db - Firestore database instance.
 * @param {object} props.user - The authenticated user object.
 * @param {string} props.currentMonth - The current budget month (YYYY-MM).
 * @param {string} props.selectedCategory - The name of the category to which the entry will be added.
 * @param {function} props.onEntryAdded - Callback function invoked after a new entry is successfully added.
 * @param {string} props.mode - The current color mode ('light' or 'dark'), passed to DateInput.
 */
export default function AddEntryModal({ 
    open, 
    onClose, 
    db, 
    user, 
    currentMonth, 
    selectedCategory, 
    onEntryAdded, 
    mode 
}) {
    /** @state {string} amount - The amount of the new entry (as a string for input). */
    const [amount, setAmount] = useState('');
    /** @state {string} entryDate - The date of the new entry (YYYY-MM-DD format). */
    const [entryDate, setEntryDate] = useState(getLocalDateString());
    /** @state {string} description - The optional description for the new entry. */
    const [description, setDescription] = useState('');
    /** @ref {object} dateInputRef - Reference to the DateInput component. */
    const dateInputRef = useRef(null);

    /**
     * Handles changes to the date input field.
     * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
     */
    const handleDateChange = (event) => {
        setEntryDate(event.target.value);
    };

    /**
     * Handles changes to the description input field.
     * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
     */
    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    /**
     * Handles the submission of the add entry form.
     * Adds the new entry to Firestore, updates category and month totals,
     * and calls `onEntryAdded`.
     * @async
     * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
     */
    const handleAddEntry = async (event) => {
        event.preventDefault();
        // Basic validation
        if (!amount || !entryDate || !user || !selectedCategory) return;

        // Convert amount string to a number
        const entryAmount = parseAmount(amount);

        try {
            // Parse the date string into a Date object for Firestore
            const [year, month, day] = entryDate.split('-').map(num => parseInt(num, 10));
            const dateObject = new Date(year, month - 1, day);

            // Prepare the entry data object
            const entry = {
                amount: entryAmount,
                date: dateObject,
                description: description.trim(),
                createdAt: new Date() // Timestamp for creation order
            };

            // Firestore path to the entries subcollection for the selected category
            const entriesPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}/entries`;

            // Add the new entry document to Firestore
            await addDoc(collection(db, entriesPath), entry);

            // --- Update Totals ---
            // Get current category data to update its total
            const categoryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}`;
            const categoryDoc = await getDoc(doc(db, categoryPath));
            const categoryData = categoryDoc.data();
            const newCategoryTotal = (categoryData.total || 0) + entryAmount;
            // Update the category's total spending
            await updateDoc(doc(db, categoryPath), { total: newCategoryTotal });

            // Get current month data to update its total
            const monthPath = `manualBudget/${user.uid}/months/${currentMonth}`;
            const monthDoc = await getDoc(doc(db, monthPath));
            const monthData = monthDoc.data();
            const newMonthTotal = (monthData.total || 0) + entryAmount;
            // Update the overall month's total spending
            await updateDoc(doc(db, monthPath), { total: newMonthTotal });

            // Notify the parent component that an entry was added (e.g., to refresh list)
            if (onEntryAdded) {
                onEntryAdded();
            }

            // Reset form fields and close the modal
            resetForm();
            onClose();
        } catch (error) {
            console.error('Error adding entry:', error);
            // TODO: Add user-facing error message
        }
    };

    /**
     * Resets the form fields to their initial/default states.
     */
    const resetForm = () => {
        setAmount('');
        setEntryDate(getLocalDateString());
        setDescription('');
    };

    /**
     * Handles closing the modal. Ensures the form is reset before calling `onClose`.
     */
    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="add-entry-modal-title"
        >
            <Fade in={open}>
                {/* Modal Paper */}
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 400 },
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography id="add-entry-modal-title" variant="h6" component="h2" gutterBottom sx={{ mb: 2 }}>
                        Add Spending Entry to "{selectedCategory}"
                    </Typography>
                    {/* Form Element */}
                    <form onSubmit={handleAddEntry}>
                        <Stack spacing={3}>
                            {/* Money Input Component */}
                            <MoneyInput
                                value={amount}
                                onChange={setAmount}
                                label="Amount"
                                required
                            />
                            
                            {/* Date Input Component */}
                            <DateInput
                                value={entryDate}
                                onChange={handleDateChange}
                                ref={dateInputRef}
                                required
                                mode={mode}
                            />
                            
                            {/* Description Text Field */}
                            <TextField
                                fullWidth
                                label="Description (optional)"
                                variant="outlined"
                                value={description}
                                onChange={handleDescriptionChange}
                                placeholder="Coffee with friends"
                                multiline
                                rows={2}
                                slotProps={{ 
                                    inputLabel: { shrink: true } // Keep label shrunk (iOS Safari fix)
                                }}
                            />
                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={!amount || !entryDate} // Disable if required fields are empty
                                >
                                    Add Entry
                                </Button>
                            </Box>
                        </Stack>
                    </form>
                </Paper>
            </Fade>
        </Modal>
    );
}
