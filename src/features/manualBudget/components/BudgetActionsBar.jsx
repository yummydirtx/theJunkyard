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

import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BarChartIcon from '@mui/icons-material/BarChart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box, Button, Grid } from '@mui/material';
import CategorySelector from './CategorySelector';

/**
 * BudgetActionsBar provides a set of actions for managing a budget.
 * @param {object} props - The component's props.
 * @param {Array<string>} props.categories - List of available category names.
 * @param {string} props.selectedOption - The currently selected category name.
 * @param {function} props.onCategoryChange - Callback for when the selected category changes.
 * @param {function} props.onEditCategory - Callback to open the edit category modal.
 * @param {function} props.onOpenAddCategoryModal - Callback to open the add category modal.
 * @param {function} props.onRemoveCategory - Callback to initiate removing the selected category.
 * @param {function} props.onOpenAddEntryModal - Callback to open the add entry modal.
 * @param {function} props.onOpenGraphsModal - Callback to open the budget graphs modal.
 * @param {function} props.onOpenRecurringExpenseModal - Callback to open the recurring expenses modal.
 */
export default function BudgetActionsBar({
    categories,
    selectedOption,
    onCategoryChange,
    onEditCategory,
    onOpenAddCategoryModal,
    onRemoveCategory,
    onOpenAddEntryModal,
    onOpenGraphsModal,
    onOpenRecurringExpenseModal,
}) {
    return (
        <Grid container spacing={2} sx={{ mb: 2, mt: 1 }} alignItems="center">
            {/* CategorySelector component for choosing a budget category. */}
            <Grid size={{ xs: 12, sm: "auto" }}>
                <CategorySelector
                    categories={categories}
                    selectedOption={selectedOption}
                    onCategoryChange={onCategoryChange}
                    onEditCategory={onEditCategory}
                    // onAddCategory and onRemoveCategory are handled by buttons below
                />
            </Grid>
            {/* Container for action buttons related to budget management. */}
            <Grid size={{ xs: 12, sm: "grow" }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={onOpenAddCategoryModal}
                        startIcon={<AddCircleOutlineIcon />}
                        sx={{ height: 'fit-content' }}
                    >
                        Add Category
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={onRemoveCategory}
                        startIcon={<DeleteOutlineIcon />}
                        disabled={!selectedOption}
                        sx={{ height: 'fit-content' }}
                    >
                        Remove Category
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        disabled={!selectedOption}
                        onClick={onOpenAddEntryModal}
                        sx={{ height: 'fit-content' }}
                    >
                        Add Entry
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<BarChartIcon />}
                        onClick={onOpenGraphsModal}
                        sx={{ height: 'fit-content' }}
                    >
                        View Budget Graphs
                    </Button>
                    <Button
                        variant="contained"
                        color="info"
                        startIcon={<AutorenewIcon />}
                        onClick={onOpenRecurringExpenseModal}
                        sx={{ height: 'fit-content' }}
                    >
                        Recurring Expenses
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
}
