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
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

/**
 * Component for selecting, adding, and removing budget categories
 */
export default function CategorySelector({
    categories,
    selectedOption,
    onCategoryChange,
    onAddCategory,
    onRemoveCategory,
    onEditCategory
}) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="budget-select-label">Categories</InputLabel>
                <Select
                    labelId="budget-select-label"
                    id="budget-select"
                    value={selectedOption}
                    label="Categories"
                    onChange={onCategoryChange}
                >
                    {categories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedOption && (
                <Tooltip title="Edit category">
                    <IconButton
                        color="primary"
                        onClick={() => onEditCategory(selectedOption)}
                        size="small"
                    >
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
}
