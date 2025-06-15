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

import React, { useEffect, useState } from 'react';
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
import { ColorPicker, categoryColors, MoneyInput } from '../../../components/common/forms';
import { parseAmount } from '../../../shared/utils/financialUtils';
import { useCategories } from '../hooks/queries/useCategories';
import { useCategoryOperations } from '../hooks/queries/useCategoryOperations';

interface EditCategoryModalProps {
    open: boolean;
    onClose: () => void;
    selectedCategory: string;
    currentMonth: string;
    onCategoryUpdated: (newName: string, oldName: string) => void;
}

/**
 * EditCategoryModalWithQuery allows users to modify an existing budget category's name,
 * spending goal, and color using TanStack Query for data management.
 */
export default function EditCategoryModalWithQuery({
    open,
    onClose,
    selectedCategory,
    currentMonth,
    onCategoryUpdated
}: EditCategoryModalProps) {
    /** @state {string} categoryName - The name of the category being edited. */
    const [categoryName, setCategoryName] = useState('');
    /** @state {string} spendingGoal - The spending goal for the category (as a string for input). */
    const [spendingGoal, setSpendingGoal] = useState('');
    /** @state {string} selectedColor - The hex value of the selected color for the category. */
    const [selectedColor, setSelectedColor] = useState(categoryColors[0].value);
    /** @state {string} error - Stores error messages, if any, during updating. */
    const [error, setError] = useState('');

    const { 
        categories, 
        isLoading: categoriesLoading 
    } = useCategories(currentMonth);

    const { 
        updateCategory, 
        isUpdatingCategory, 
        updateCategoryError 
    } = useCategoryOperations(currentMonth);

    // Effect to populate category data when the modal opens or the selected category changes.
    useEffect(() => {
        if (open && selectedCategory && categories.length > 0) {
            const category = categories.find(cat => cat.name === selectedCategory);
            if (category) {
                setCategoryName(selectedCategory);
                setSpendingGoal(category.budget !== undefined ? category.budget.toString() : '0');
                setSelectedColor(category.color || categoryColors[0].value);
                setError('');
            } else {
                setError('Category not found');
            }
        }
    }, [open, selectedCategory, categories]);

    // Update error state when mutation error occurs
    useEffect(() => {
        if (updateCategoryError) {
            setError(updateCategoryError.message || 'Failed to update category');
        }
    }, [updateCategoryError]);

    /**
     * Handles changes to the category name input field.
     */
    const handleCategoryNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryName(event.target.value);
    };

    /**
     * Handles changes to the selected color.
     */
    const handleColorChange = (color: string) => {
        setSelectedColor(color);
    };

    /**
     * Handles the submission of the edited category form.
     */
    const handleUpdateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!categoryName.trim()) return;

        setError('');

        try {
            // Convert spending goal to a number with 2 decimal places
            const budgetAmount = parseAmount(spendingGoal);

            await updateCategory({
                currentName: selectedCategory,
                newName: categoryName.trim() !== selectedCategory ? categoryName.trim() : undefined,
                goal: budgetAmount,
                color: selectedColor
            });

            // Notify parent component and close modal
            onCategoryUpdated(categoryName.trim(), selectedCategory);
            handleClose();

        } catch (error: any) {
            console.error('Error updating category:', error);
            setError(error.message || 'Failed to update category');
        }
    };

    /**
     * Handles closing the modal. Resets all local state.
     */
    const handleClose = () => {
        setCategoryName('');
        setSpendingGoal('');
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
                                disabled={isUpdatingCategory}
                            />
                            
                            <MoneyInput
                                value={spendingGoal}
                                onChange={setSpendingGoal}
                                label="Spending Goal"
                                helperText="Set a monthly spending target for this category"
                                disabled={isUpdatingCategory}
                            />
                            
                            <ColorPicker 
                                selectedColor={selectedColor} 
                                onChange={handleColorChange}
                                disabled={isUpdatingCategory}
                            />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button onClick={handleClose} disabled={isUpdatingCategory}>Cancel</Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isUpdatingCategory || !categoryName.trim()}
                                >
                                    {isUpdatingCategory ? 'Updating...' : 'Update'}
                                </Button>
                            </Box>
                        </Stack>
                    </form>
                </Paper>
            </Fade>
        </Modal>
    );
}
