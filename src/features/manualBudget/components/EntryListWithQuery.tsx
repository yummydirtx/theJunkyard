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

import React, { useImperativeHandle, forwardRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress
} from '@mui/material';
import { useEntries } from '../hooks/queries/useEntries';
import EntryMenu from './EntryMenu';

interface EntryListProps {
    currentMonth: string;
    selectedCategory: string;
    mode: 'light' | 'dark';
}

export interface EntryListRef {
    refreshEntries: () => void;
}

/**
 * EntryList component displays a list of budget entries for a selected category and month.
 * This TypeScript version uses TanStack Query for data fetching and caching.
 */
const EntryListWithQuery = forwardRef<EntryListRef, EntryListProps>(({ 
    currentMonth, 
    selectedCategory, 
    mode 
}, ref) => {
    const { 
        entries, 
        isLoading,
        refetch,
        updateEntry,
        deleteEntry 
    } = useEntries(currentMonth, selectedCategory);

    // Expose the refreshEntries function to parent components via ref.
    useImperativeHandle(ref, () => ({
        refreshEntries: () => {
            refetch();
        }
    }));

    /**
     * Formats a date object or string into a localized date string.
     */
    const formatDate = (date: Date | string): string => {
        return new Date(date).toLocaleDateString();
    };

    /**
     * Formats a numerical amount into a currency string (e.g., $1,234.56).
     */
    const formatAmount = (amount: number): string => {
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    /**
     * Handles entry updates from the EntryMenu component
     */
    const handleEntryUpdated = () => {
        refetch();
    };

    if (!selectedCategory) {
        // If no category is selected, don't render anything.
        return null;
    }

    return (
        <Paper
            sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden'
            }}
            elevation={2}
        >
            <Typography variant="h6" gutterBottom>
                Entries for {selectedCategory}
            </Typography>

            <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : entries.length > 0 ? (
                    <List>
                        {entries.map((entry, index) => (
                            <Box key={entry.id}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography component="span" variant="subtitle1">
                                                    {formatDate(entry.date)}
                                                </Typography>
                                                <Typography component="span" variant="subtitle1" fontWeight="bold">
                                                    {formatAmount(entry.amount)}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            entry.description || 'No description'
                                        }
                                    />
                                    <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                                        <EntryMenu
                                            entry={entry}
                                            currentMonth={currentMonth}
                                            selectedCategory={selectedCategory}
                                            onEntryUpdated={handleEntryUpdated}
                                            mode={mode}
                                            updateEntry={updateEntry}
                                            deleteEntry={deleteEntry}
                                        />
                                    </Box>
                                </ListItem>
                                {index < entries.length - 1 && <Divider component="li" />}
                            </Box>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body1" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                        No entries yet. Add your first expense using the "Add Entry" button.
                    </Typography>
                )}
            </Box>
        </Paper>
    );
});

EntryListWithQuery.displayName = 'EntryListWithQuery';

export default EntryListWithQuery;
