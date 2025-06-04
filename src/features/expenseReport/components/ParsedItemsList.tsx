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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { ExpenseItem } from '../types';

interface ParsedItemsListProps {
  items: ExpenseItem[];
  onItemChange: (index: number, field: keyof ExpenseItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  isProcessing: boolean;
}

export default function ParsedItemsList({ items, onItemChange, onAddItem, onRemoveItem, isProcessing }: ParsedItemsListProps) {
    if (items.length === 0 && !isProcessing) {
        return (
            <Button
                startIcon={<AddCircleOutlineIcon />}
                onClick={onAddItem}
                size="small"
                sx={{ mt: 1, mb: 1 }}
                disabled={isProcessing}
            >
                Add Expense Item
            </Button>
        );
    }

    if (items.length === 0) return null;

    return (
        <Box sx={{ my: 1, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="caption" display="block" gutterBottom sx={{ color: 'text.secondary', mb: 1 }}>
                Parsed Items (Editable):
            </Typography>
            <List dense disablePadding>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        <ListItem disableGutters sx={{ py: 0.5, pr: 0 }}>
                            <Grid container spacing={1} alignItems="center">
                                <Grid size={7}>
                                    <TextField
                                        label={`Item ${index + 1} Desc.`}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        value={item.description || item.name || ''}
                                        onChange={(e) => onItemChange(index, 'description', e.target.value)}
                                        disabled={isProcessing}
                                    />
                                </Grid>
                                <Grid size={4}>
                                    <TextField
                                        label="Price"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        type="number"
                                        value={item.price !== undefined ? item.price.toString() : ''}
                                        onChange={(e) => onItemChange(index, 'price', e.target.value)}
                                        disabled={isProcessing}
                                        slotProps={{
                                            input: {
                                                startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                                            },
                                            htmlInput: {
                                                step: "0.01", min: "0"
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid size={1} sx={{ textAlign: 'right', pl: 0 }}>
                                    <IconButton
                                        aria-label="remove item"
                                        onClick={() => onRemoveItem(index)}
                                        disabled={isProcessing}
                                        size="small"
                                        color="error"
                                    >
                                        <RemoveCircleOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </ListItem>
                        {index < items.length - 1 && <Divider component="li" sx={{ opacity: 0.6, my: 0.5 }} />}
                    </React.Fragment>
                ))}
            </List>
            <Button
                startIcon={<AddCircleOutlineIcon />}
                onClick={onAddItem}
                size="small"
                sx={{ mt: 1 }}
                disabled={isProcessing}
            >
                Add Item
            </Button>
            <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mt: 1 }}>
                Note: Editing item prices does not automatically update the total amount field below.
            </Typography>
        </Box>
    );
}
