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

import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
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
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import EntryMenu from './EntryMenu';

const EntryList = forwardRef(({ db, user, currentMonth, selectedCategory, sx = {}, mode }, ref) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEntries = useCallback(async () => {
        if (!user || !db || !currentMonth || !selectedCategory) {
            setEntries([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const entriesPath = `users/${user.uid}/budgets/${currentMonth}/categories/${selectedCategory}/entries`;
            const entriesCollection = collection(db, entriesPath);
            const q = query(entriesCollection, orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            const fetchedEntries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEntries(fetchedEntries);
        } catch (err) {
            console.error("Error fetching entries:", err);
            setError("Failed to load entries.");
            setEntries([]);
        } finally {
            setLoading(false);
        }
    }, [db, user, currentMonth, selectedCategory]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    useImperativeHandle(ref, () => ({
        refreshEntries: fetchEntries
    }));

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    const formatAmount = (amount) => {
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

            <Box sx={{ ...sx, overflow: 'auto', flexGrow: 1 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                )}
                {error && (
                    <Typography color="error" sx={{ textAlign: 'center', p: 3 }}>
                        {error}
                    </Typography>
                )}
                {!loading && !error && (
                    entries.length > 0 ? (
                        <List sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
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
                                                mode={mode}
                                            />
                                        </Box>
                                    </ListItem>
                                    {index < entries.length - 1 && <Divider component="li" />}
                                </Box>
                            ))}
                        </List>
                    ) : (
                        <Typography sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
                            No entries found for this category this month. Add one!
                        </Typography>
                    )
                )}
            </Box>
        </Paper>
    );
});

export default EntryList;
