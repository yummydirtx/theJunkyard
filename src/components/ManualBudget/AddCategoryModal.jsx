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
    InputAdornment,
    Grid,
    Tooltip,
    Popover
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Predefined colors for categories
const categoryColors = [
    { name: 'Blue', value: '#1976d2' },
    { name: 'Green', value: '#2e7d32' },
    { name: 'Red', value: '#d32f2f' },
    { name: 'Purple', value: '#7b1fa2' },
    { name: 'Orange', value: '#ed6c02' },
    { name: 'Teal', value: '#0d7377' },
    { name: 'Pink', value: '#c2185b' },
    { name: 'Gray', value: '#757575' },
    { name: 'Amber', value: '#ff8f00' },
];

export default function AddCategoryModal({ open, onClose, db, user, currentMonth, onCategoryAdded }) {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [spendingGoal, setSpendingGoal] = useState('');
    const [selectedColor, setSelectedColor] = useState(categoryColors[0].value);
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null);

    const handleCategoryNameChange = (event) => {
        setNewCategoryName(event.target.value);
    };

    const handleSpendingGoalChange = (event) => {
        // Only allow numbers and decimal points
        const value = event.target.value.replace(/[^0-9.]/g, '');
        setSpendingGoal(value);
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color);
    };

    const handleOpenColorPicker = (event) => {
        setColorPickerAnchor(event.currentTarget);
    };

    const handleCloseColorPicker = () => {
        setColorPickerAnchor(null);
    };

    const handleCustomColorSelect = (color) => {
        setSelectedColor(color);
    };

    const handleAddCategory = async (event) => {
        event.preventDefault();
        if (!newCategoryName.trim() || !user) return;

        // Convert spending goal to a number, default to 0 if empty
        // Round to nearest hundredth (2 decimal places)
        const goalAmount = spendingGoal ? Math.round(parseFloat(spendingGoal) * 100) / 100 : 0;

        try {
            // First, check if the month document exists and create it if needed
            const monthPath = `manualBudget/${user.uid}/months/${currentMonth}`;
            const monthDoc = await getDoc(doc(db, monthPath));

            // If month document doesn't exist yet, create it with initial values
            if (!monthDoc.exists()) {
                await setDoc(doc(db, monthPath), {
                    goal: 0,
                    total: 0
                });
            }

            // Add the new category to Firestore
            const categoryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${newCategoryName}`;
            await setDoc(doc(db, categoryPath), {
                goal: goalAmount,
                total: 0,
                color: selectedColor // Add the selected color
            });

            // Update the current month total goal
            const updatedMonthDoc = await getDoc(doc(db, monthPath));
            const monthData = updatedMonthDoc.data();
            const newTotalGoal = (monthData.goal || 0) + goalAmount;
            await setDoc(doc(db, monthPath), { goal: newTotalGoal }, { merge: true });

            // Notify parent component about the new category
            onCategoryAdded(newCategoryName);

            // Reset form and close modal
            setNewCategoryName('');
            setSpendingGoal('');
            setSelectedColor(categoryColors[0].value);
            onClose();
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    const handleClose = () => {
        setNewCategoryName('');
        setSpendingGoal('');
        setSelectedColor(categoryColors[0].value);
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
                            
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Category Color
                                </Typography>
                                <Grid container spacing={1}>
                                    {categoryColors.map((color) => (
                                        <Grid item key={color.value}>
                                            <Tooltip title={color.name}>
                                                <Button
                                                    sx={{
                                                        bgcolor: color.value,
                                                        minWidth: '36px',
                                                        height: '36px',
                                                        p: 0,
                                                        borderRadius: '50%',
                                                        border: selectedColor === color.value ? '3px solid #000' : 'none',
                                                        '&:hover': {
                                                            bgcolor: color.value,
                                                            opacity: 0.8,
                                                        }
                                                    }}
                                                    onClick={() => handleColorSelect(color.value)}
                                                    aria-label={`Select ${color.name} color`}
                                                />
                                            </Tooltip>
                                        </Grid>
                                    ))}
                                    <Grid item>
                                        <Tooltip title="Custom Color">
                                            <Button
                                                sx={{
                                                    minWidth: '36px',
                                                    height: '36px',
                                                    p: 0,
                                                    borderRadius: '50%',
                                                    border: !categoryColors.some(c => c.value === selectedColor) ? '3px solid #000' : 'none',
                                                    background: 'linear-gradient(135deg, #ff5722 0%, #2196f3 50%, #4caf50 100%)',
                                                    '&:hover': {
                                                        opacity: 0.8,
                                                    }
                                                }}
                                                onClick={handleOpenColorPicker}
                                                aria-label="Select custom color"
                                            />
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                                
                                <Popover
                                    open={Boolean(colorPickerAnchor)}
                                    anchorEl={colorPickerAnchor}
                                    onClose={handleCloseColorPicker}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'center',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'center',
                                    }}
                                >
                                    <Box sx={{ p: 2 }}>
                                        <HexColorPicker 
                                            color={selectedColor} 
                                            onChange={handleCustomColorSelect} 
                                        />
                                        <Box 
                                            sx={{ 
                                                mt: 2, 
                                                display: 'flex',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Button 
                                                variant="contained" 
                                                onClick={handleCloseColorPicker}
                                                sx={{ 
                                                    bgcolor: selectedColor,
                                                    '&:hover': {
                                                        bgcolor: selectedColor,
                                                        opacity: 0.8,
                                                    }
                                                }}
                                            >
                                                Select
                                            </Button>
                                        </Box>
                                    </Box>
                                </Popover>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                                <Button type="submit" variant="contained" color="primary">Add</Button>
                            </Box>
                        </Stack>
                    </form>
                </Paper>
            </Fade>
        </Modal>
    );
}
