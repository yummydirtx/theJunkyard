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
    Alert,
    Box,
    Button,
    Fade,
    Modal,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import ColorPicker, { categoryColors } from './shared/ColorPicker';
import MoneyInput from './shared/MoneyInput';
import { parseAmount } from './utils/budgetUtils';

/**
 * EditCategoryModal allows users to modify an existing budget category's name,
 * spending goal, and color. It handles data updates in Firestore, including
 * transferring entries if the category name changes.
 * @param {object} props - The component's props.
 * @param {boolean} props.open - Controls the visibility of the modal.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {object} props.db - Firestore database instance.
 * @param {object} props.user - The authenticated user object.
 * @param {string} props.currentMonth - The current budget month (YYYY-MM).
 * @param {string} props.selectedCategory - The name of the category being edited.
 * @param {function} props.onCategoryUpdated - Callback invoked after the category is successfully updated.
 *                                            It receives the new category name and old category name.
 */
export default function EditCategoryModal({
    open,
    onClose,
    db,
    user,
    currentMonth,
    selectedCategory,
    onCategoryUpdated
}) {
    /** @state {string} categoryName - The name of the category being edited. */
    const [categoryName, setCategoryName] = useState('');
    /** @state {string} spendingGoal - The spending goal for the category (as a string for input). */
    const [spendingGoal, setSpendingGoal] = useState('');
    /** @state {number} originalGoal - The original spending goal, used to calculate differences for month totals. */
    const [originalGoal, setOriginalGoal] = useState(0);
    /** @state {string} selectedColor - The hex value of the selected color for the category. */
    const [selectedColor, setSelectedColor] = useState(categoryColors[0].value);
    /** @state {boolean} loading - Indicates if category data is being fetched or updated. */
    const [loading, setLoading] = useState(true);
    /** @state {string} error - Stores error messages, if any, during fetching or updating. */
    const [error, setError] = useState('');

    // Effect to fetch and populate category data when the modal opens or the selected category changes.
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

    /**
     * Handles changes to the category name input field.
     * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
     */
    const handleCategoryNameChange = (event) => {
        setCategoryName(event.target.value);
    };

    /**
     * Handles changes to the selected color.
     * @param {string} color - The new hex color value.
     */
    const handleColorChange = (color) => {
        setSelectedColor(color);
    };

    /**
     * Handles the submission of the edited category form.
     * Updates the category in Firestore. If the name changed, it creates a new category,
     * transfers entries, and deletes the old one. Updates month totals accordingly.
     * @async
     * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
     */
    const handleUpdateCategory = async (event) => {
        event.preventDefault();
        if (!categoryName.trim() || !user) return;

        setLoading(true);
        setError('');

        try {
            // Convert spending goal to a number with 2 decimal places
            const goalAmount = parseAmount(spendingGoal);

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

    /**
     * Handles closing the modal. Resets all local state.
     */
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
                            
                            <MoneyInput
                                value={spendingGoal}
                                onChange={setSpendingGoal}
                                label="Spending Goal"
                                helperText="Set a monthly spending target for this category"
                                disabled={loading}
                            />
                            
                            <ColorPicker 
                                selectedColor={selectedColor} 
                                onChange={handleColorChange}
                                disabled={loading}
                            />
                            
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
