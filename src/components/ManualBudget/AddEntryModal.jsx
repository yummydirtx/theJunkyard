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
    Stack,
    InputAdornment
} from '@mui/material';
import { doc, setDoc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function AddEntryModal({ open, onClose, db, user, currentMonth, selectedCategory, onEntryAdded, mode }) {
    const [amount, setAmount] = useState('');
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [description, setDescription] = useState('');
    const dateInputRef = useRef(null);

    const handleAmountChange = (event) => {
        // Only allow numbers and decimal points
        const value = event.target.value.replace(/[^0-9.]/g, '');
        setAmount(value);
    };

    const handleDateChange = (event) => {
        setEntryDate(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    const handleCalendarClick = () => {
        if (dateInputRef.current) {
            // Try to open the native date picker using multiple methods for cross-browser compatibility
            dateInputRef.current.focus();
            
            // For modern browsers that support showPicker
            if (typeof dateInputRef.current.showPicker === 'function') {
                dateInputRef.current.showPicker();
            } else {
                // Fallback - simulate click on the input to open the date picker
                dateInputRef.current.click();
            }
        }
    };

    const handleAddEntry = async (event) => {
        event.preventDefault();
        if (!amount || !entryDate || !user || !selectedCategory) return;
        
        // Convert amount to a number
        // Round to nearest hundredth (2 decimal places)
        const entryAmount = Math.round(parseFloat(amount) * 100) / 100;

        try {
            // Parse the date correctly to avoid timezone issues
            const [year, month, day] = entryDate.split('-').map(num => parseInt(num, 10));
            const dateObject = new Date(year, month - 1, day);  // month is 0-indexed in JavaScript Date
            
            // Create entry object
            const entry = {
                amount: entryAmount,
                date: dateObject,
                description: description.trim(),
                createdAt: new Date()
            };

            // Path to entries collection for this category
            const entriesPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}/entries`;
            
            // Add the entry to Firestore
            await addDoc(collection(db, entriesPath), entry);

            // Update the category total
            const categoryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}`;
            const categoryDoc = await getDoc(doc(db, categoryPath));
            const categoryData = categoryDoc.data();
            const newCategoryTotal = (categoryData.total || 0) + entryAmount;
            await updateDoc(doc(db, categoryPath), { total: newCategoryTotal });

            // Update the month total
            const monthPath = `manualBudget/${user.uid}/months/${currentMonth}`;
            const monthDoc = await getDoc(doc(db, monthPath));
            const monthData = monthDoc.data();
            const newMonthTotal = (monthData.total || 0) + entryAmount;
            await updateDoc(doc(db, monthPath), { total: newMonthTotal });
            
            // Notify parent that a new entry was added
            if (onEntryAdded) {
                onEntryAdded();
            }
            
            // Reset form and close modal
            resetForm();
            onClose();
        } catch (error) {
            console.error('Error adding entry:', error);
        }
    };

    const resetForm = () => {
        setAmount('');
        setEntryDate(new Date().toISOString().split('T')[0]);
        setDescription('');
    };

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
                    <Typography id="add-entry-modal-title" variant="h6" component="h2" gutterBottom>
                        Add Spending Entry to "{selectedCategory}"
                    </Typography>
                    <form onSubmit={handleAddEntry}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Amount"
                                variant="outlined"
                                value={amount}
                                onChange={handleAmountChange}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    },
                                }}
                                placeholder="0.00"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                variant="outlined"
                                value={entryDate}
                                onChange={handleDateChange}
                                required
                                inputRef={dateInputRef}
                                sx={{
                                    '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                        display: 'none' // Hide default calendar icon
                                    }
                                }}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <CalendarTodayIcon 
                                                    sx={{ 
                                                        color: mode === 'light' ? 'black' : 'white',
                                                        cursor: 'pointer' 
                                                    }} 
                                                    onClick={handleCalendarClick}
                                                />
                                            </InputAdornment>
                                        ),
                                    },
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
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
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary"
                                    disabled={!amount || !entryDate}
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
