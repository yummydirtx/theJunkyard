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

import React, { useRef, useState } from 'react';
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
import { DateInput, MoneyInput } from '../../../components/common/forms';
import { parseAmount } from '../../../shared/utils/financialUtils';
import { useEntries } from '../hooks/queries/useEntries';

/**
 * Helper function to get a date string in YYYY-MM-DD format from a Date object,
 * respecting the local timezone.
 */
const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface AddEntryModalWithQueryProps {
    open: boolean;
    onClose: () => void;
    currentMonth: string;
    selectedCategory: string;
    onEntryAdded?: () => void;
    mode: 'light' | 'dark';
}

/**
 * AddEntryModalWithQuery provides a form for users to add a new spending entry to a selected category.
 * This TypeScript version uses TanStack Query mutations for data management.
 */
export default function AddEntryModalWithQuery({ 
    open, 
    onClose, 
    currentMonth, 
    selectedCategory, 
    onEntryAdded, 
    mode 
}: AddEntryModalWithQueryProps) {
    const [amount, setAmount] = useState('');
    const [entryDate, setEntryDate] = useState(getLocalDateString());
    const [description, setDescription] = useState('');
    const dateInputRef = useRef<HTMLInputElement>(null);

    const { addEntry, isAddingEntry } = useEntries(currentMonth, selectedCategory);

    /**
     * Handles changes to the date input field.
     */
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntryDate(event.target.value);
    };

    /**
     * Handles changes to the description input field.
     */
    const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
    };

    /**
     * Handles the submission of the add entry form.
     */
    const handleAddEntry = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Basic validation
        if (!amount || !entryDate || !selectedCategory) return;

        // Convert amount string to a number
        const entryAmount = parseAmount(amount);

        try {
            // Parse the date string into a Date object
            const [year, month, day] = entryDate.split('-').map(num => parseInt(num, 10));
            const dateObject = new Date(year, month - 1, day);

            // Add the entry using TanStack Query mutation
            addEntry({
                amount: entryAmount,
                date: dateObject,
                description: description.trim(),
                category: selectedCategory,
            });

            // Notify the parent component that an entry was added
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
                    
                    <form onSubmit={handleAddEntry}>
                        <Stack spacing={3}>
                            <MoneyInput
                                value={amount}
                                onChange={setAmount}
                                label="Amount"
                                required
                            />
                            
                            <DateInput
                                value={entryDate}
                                onChange={handleDateChange}
                                ref={dateInputRef}
                                required
                                mode={mode}
                            />
                            
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
                                    inputLabel: { shrink: true }
                                }}
                            />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="outlined" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={!amount || !entryDate || isAddingEntry}
                                >
                                    {isAddingEntry ? 'Adding...' : 'Add Entry'}
                                </Button>
                            </Box>
                        </Stack>
                    </form>
                </Paper>
            </Fade>
        </Modal>
    );
}
