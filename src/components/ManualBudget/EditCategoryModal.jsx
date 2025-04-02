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

import { useState, useEffect } from 'react';
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
    Alert,
    Grid,
    Tooltip
} from '@mui/material';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

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

export default function EditCategoryModal({
    open,
    onClose,
    db,
    user,
    currentMonth,
    selectedCategory,
    onCategoryUpdated
}) {
    const [categoryName, setCategoryName] = useState('');
    const [spendingGoal, setSpendingGoal] = useState('');
    const [originalGoal, setOriginalGoal] = useState(0);
    const [selectedColor, setSelectedColor] = useState(categoryColors[0].value);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch current category data when modal opens
    useEffect(() => {
        if (open && selectedCategory) {
            setLoading(true);
            setError('');

            const fetchCategoryData = async () => {
                try {
                    const categoryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}`;
                    const categoryDoc = await getDoc(doc(db, categoryPath));

                    if (categoryDoc.exists()) {
                        const data = categoryDoc.data();
                        setCategoryName(selectedCategory);
                        setSpendingGoal(data.goal ? data.goal.toString() : '0');
                        setOriginalGoal(data.goal || 0);
                        setSelectedColor(data.color || categoryColors[0].value);
                    } else {
                        setError('Category data not found');
                    }
                } catch (err) {
                    console.error('Error fetching category data:', err);
                    setError('Failed to load category data');
                } finally {
                    setLoading(false);
                }
            };

            fetchCategoryData();
        }
    }, [open, selectedCategory, db, user, currentMonth]);

    const handleCategoryNameChange = (event) => {
        setCategoryName(event.target.value);
    };

    const handleSpendingGoalChange = (event) => {
        // Only allow numbers and decimal points
        const value = event.target.value.replace(/[^0-9.]/g, '');
        setSpendingGoal(value);
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color);
    };

    const handleUpdateCategory = async (event) => {
        event.preventDefault();
        if (!categoryName.trim() || !user) return;

        setLoading(true);
        setError('');

        try {
            // Convert spending goal to a number, default to 0 if empty
            // Round to nearest hundredth (2 decimal places)
            const goalAmount = spendingGoal ? Math.round(parseFloat(spendingGoal) * 100) / 100 : 0;

            // Path references
            const oldCategoryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}`;
            const monthPath = `manualBudget/${user.uid}/months/${currentMonth}`;

            // Get current category data
            const categoryDoc = await getDoc(doc(db, oldCategoryPath));
            if (!categoryDoc.exists()) {
                throw new Error('Category not found');
            }

            const categoryData = categoryDoc.data();

            // If category name is unchanged, just update the goal
            if (categoryName === selectedCategory) {
                await updateDoc(doc(db, oldCategoryPath), {
                    goal: goalAmount,
                    color: selectedColor
                });

                // Update month total goal
                const monthDoc = await getDoc(doc(db, monthPath));
                const monthData = monthDoc.data();
                const goalDifference = goalAmount - originalGoal;
                const newTotalGoal = (monthData.goal || 0) + goalDifference;
                await updateDoc(doc(db, monthPath), {
                    goal: Math.max(0, newTotalGoal)
                });
            } else {
                // If category name changed, create new category and transfer data
                const newCategoryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${categoryName}`;

                // Check if new category name already exists
                const newCategoryDoc = await getDoc(doc(db, newCategoryPath));
                if (newCategoryDoc.exists()) {
                    throw new Error('A category with this name already exists');
                }

                // Create new category with updated data
                await setDoc(doc(db, newCategoryPath), {
                    goal: goalAmount,
                    total: categoryData.total || 0,
                    color: selectedColor
                });

                // Transfer all entries from old category to new category
                const entriesPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}/entries`;
                const entriesSnapshot = await getDocs(collection(db, entriesPath));

                // Create new entries collection under new category
                const newEntriesPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${categoryName}/entries`;

                // Transfer each entry
                const transferPromises = entriesSnapshot.docs.map(entryDoc => {
                    const entryData = entryDoc.data();
                    return setDoc(doc(db, `${newEntriesPath}/${entryDoc.id}`), entryData);
                });

                await Promise.all(transferPromises);

                // Delete old category after transfer
                await deleteDoc(doc(db, oldCategoryPath));

                // Update month total goal
                const monthDoc = await getDoc(doc(db, monthPath));
                const monthData = monthDoc.data();
                const goalDifference = goalAmount - originalGoal;
                const newTotalGoal = (monthData.goal || 0) + goalDifference;
                await updateDoc(doc(db, monthPath), {
                    goal: Math.max(0, newTotalGoal)
                });
            }

            // Notify parent component and close modal
            onCategoryUpdated(categoryName, selectedCategory);
            handleClose();

        } catch (error) {
            console.error('Error updating category:', error);
            setError(error.message || 'Failed to update category');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCategoryName('');
        setSpendingGoal('');
        setOriginalGoal(0);
        setSelectedColor(categoryColors[0].value);
        setError('');
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="edit-category-modal-title"
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
                    <Typography id="edit-category-modal-title" variant="h6" component="h2" gutterBottom>
                        Edit Category
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleUpdateCategory}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Category Name"
                                variant="outlined"
                                value={categoryName}
                                onChange={handleCategoryNameChange}
                                required
                                disabled={loading}
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
                                disabled={loading}
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
                                                    disabled={loading}
                                                    aria-label={`Select ${color.name} color`}
                                                />
                                            </Tooltip>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || !categoryName.trim()}
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </Button>
                            </Box>
                        </Stack>
                    </form>
                </Paper>
            </Fade>
        </Modal>
    );
}
