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

import React from 'react';
import { Box, Button, Grid } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import CategorySelector from './CategorySelector';

export default function BudgetActionsBar({
    categories,
    selectedOption,
    onCategoryChange,
    onEditCategory,
    onOpenAddCategoryModal,
    onRemoveCategory,
    onOpenAddEntryModal,
    onOpenGraphsModal,
}) {
    return (
        <Grid container spacing={2} sx={{ mb: 2, mt: 1 }} alignItems="center">
            {/* Use size prop for Grid v2 responsive behavior */}
            <Grid item size={{ xs: 12, sm: 'auto' }}>
                <CategorySelector
                    categories={categories}
                    selectedOption={selectedOption}
                    onCategoryChange={onCategoryChange}
                    onEditCategory={onEditCategory}
                />
            </Grid>
            {/* Use size prop for Grid v2 responsive behavior, 'true' allows it to take remaining space */}
            <Grid item size={{ xs: 12, sm: true }}>
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
                </Box>
            </Grid>
        </Grid>
    );
}