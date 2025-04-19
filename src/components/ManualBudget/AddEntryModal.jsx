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

import { useState, useRef } from 'react';
import {
    Modal,
    Fade,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Stack
} from '@mui/material';
import { doc, setDoc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import MoneyInput from './shared/MoneyInput';
import DateInput from './shared/DateInput';
import { parseAmount } from './utils/budgetUtils';

// Helper function to get YYYY-MM-DD from a Date object using local timezone
const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Modal component for adding a new spending entry.
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
    // State for the form fields
    const [amount, setAmount] = useState('');
    const [entryDate, setEntryDate] = useState(getLocalDateString()); // Default to today's date
    const [description, setDescription] = useState('');
    const dateInputRef = useRef(null); // Ref for the DateInput component

    // Update state when the date input changes
    const handleDateChange = (event) => {
        setEntryDate(event.target.value);
    };

    // Update state when the description input changes
    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    // Handles the form submission to add the new entry
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

    // Resets the form fields to their initial state
    const resetForm = () => {
        setAmount('');
        setEntryDate(getLocalDateString()); // Reset date to today
        setDescription('');
    };

    // Handles closing the modal, ensuring the form is reset
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
