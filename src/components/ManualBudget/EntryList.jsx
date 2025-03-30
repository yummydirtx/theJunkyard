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

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemSecondaryAction,
    Divider,
    CircularProgress
} from '@mui/material';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import EntryMenu from './EntryMenu';

const EntryList = forwardRef(({ db, user, currentMonth, selectedCategory }, ref) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchEntries = async () => {
        if (!selectedCategory || !user || !db) return;
        
        setLoading(true);
        try {
            const entriesPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}/entries`;
            const entriesQuery = query(
                collection(db, entriesPath),
                orderBy('date', 'desc'),
                orderBy('createdAt', 'desc')
            );
            
            const entriesSnapshot = await getDocs(entriesQuery);
            const entriesList = entriesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore timestamps to JavaScript Dates
                date: doc.data().date?.toDate() || new Date(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));
            
            setEntries(entriesList);
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
        }
    };

    // Expose the refresh function via ref
    useImperativeHandle(ref, () => ({
        refreshEntries: fetchEntries
    }));

    useEffect(() => {
        // Reset entries when category changes
        setEntries([]);
        
        // Only fetch if we have a selected category
        if (!selectedCategory || !user || !db) return;
        
        fetchEntries();
    }, [db, user, currentMonth, selectedCategory]);

    // Format date for display
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };
    
    // Format amount for display with dollar sign
    const formatAmount = (amount) => {
        return `$${amount.toFixed(2)}`;
    };

    if (!selectedCategory) {
        return null;
    }

    return (
        <Paper
            sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                maxHeight: 400,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
            elevation={2}
        >
            <Typography variant="h6" gutterBottom>
                Entries for {selectedCategory}
            </Typography>
            
            <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                {loading ? (
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
                                            db={db}
                                            user={user}
                                            currentMonth={currentMonth}
                                            selectedCategory={selectedCategory}
                                            onEntryUpdated={fetchEntries}
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

export default EntryList;
