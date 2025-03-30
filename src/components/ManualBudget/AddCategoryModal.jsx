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

import { useState } from 'react';
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
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function AddCategoryModal({ open, onClose, db, user, currentMonth, onCategoryAdded }) {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [spendingGoal, setSpendingGoal] = useState('');

    const handleCategoryNameChange = (event) => {
        setNewCategoryName(event.target.value);
    };
    
    const handleSpendingGoalChange = (event) => {
        // Only allow numbers and decimal points
        const value = event.target.value.replace(/[^0-9.]/g, '');
        setSpendingGoal(value);
    };

    const handleAddCategory = async (event) => {
        event.preventDefault();
        if (!newCategoryName.trim() || !user) return;
        
        // Convert spending goal to a number, default to 0 if empty
        // Round to nearest hundredth (2 decimal places)
        const goalAmount = spendingGoal ? Math.round(parseFloat(spendingGoal) * 100) / 100 : 0;

        try {
            // Add the new category to Firestore
            const categoryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${newCategoryName}`;
            await setDoc(doc(db, categoryPath), {
                goal: goalAmount,
                total: 0
            });

            // Update the current month total goal
            const monthPath = `manualBudget/${user.uid}/months/${currentMonth}`;
            const monthDoc = await getDoc(doc(db, monthPath));
            const monthData = monthDoc.data();
            const newTotalGoal = (monthData.goal || 0) + goalAmount;
            await setDoc(doc(db, monthPath), { goal: newTotalGoal }, { merge: true });

            // Notify parent component about the new category
            onCategoryAdded(newCategoryName);
            
            // Reset form and close modal
            setNewCategoryName('');
            setSpendingGoal('');
            onClose();
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    const handleClose = () => {
        setNewCategoryName('');
        setSpendingGoal('');
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="add-category-modal-title"
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
                    <Typography id="add-category-modal-title" variant="h6" component="h2" gutterBottom>
                        Add New Category
                    </Typography>
                    <form onSubmit={handleAddCategory}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Category Name"
                                variant="outlined"
                                value={newCategoryName}
                                onChange={handleCategoryNameChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Spending Goal"
                                variant="outlined"
                                value={spendingGoal}
                                onChange={handleSpendingGoalChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                placeholder="0.00"
                                helperText="Set a monthly spending target for this category"
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button type="submit" variant="contained">Add</Button>
                            </Box>
                        </Stack>
                    </form>
                </Paper>
            </Fade>
        </Modal>
    );
}
