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

import React, { useState, useEffect } from 'react';
import {
    Modal,
    Fade,
    Paper,
    Typography,
    Button,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Divider,
    useTheme,
    Alert
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import AddIcon from '@mui/icons-material/Add';

/**
 * MonthSelectorModal allows users to select a budget month from a list of existing months
 * or add the current calendar month if it doesn't exist.
 * @param {object} props - The component's props.
 * @param {boolean} props.open - Controls the visibility of the modal.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {object} props.db - Firestore database instance.
 * @param {object} props.user - The authenticated user object.
 * @param {string} props.currentMonth - The currently active budget month (YYYY-MM).
 * @param {function} props.onMonthSelect - Callback function invoked when a month is selected.
 * @param {string} props.mode - The current color mode ('light' or 'dark').
 * @param {function} props.addNewMonth - Function to add a new month to the budget.
 */
export default function MonthSelectorModal({ open, onClose, db, user, currentMonth, onMonthSelect, mode, addNewMonth }) {
    /** @state {Array<string>} months - List of available budget months (YYYY-MM format). */
    const [months, setMonths] = useState([]);
    /** @state {boolean} loading - Indicates if the months list is currently being fetched. */
    const [loading, setLoading] = useState(true);
    /** @state {string} currentCalendarMonth - The current calendar month in YYYY-MM format. */
    const [currentCalendarMonth, setCurrentCalendarMonth] = useState('');
    /** @state {string} error - Stores error messages, if any, during month fetching or adding. */
    const [error, setError] = useState('');
    const theme = useTheme();

    /**
     * Gets the current calendar month in YYYY-MM format.
     * @returns {string} The current month string.
     */
    const getCurrentMonth = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    };

    useEffect(() => {
        setCurrentCalendarMonth(getCurrentMonth());

        if (open && user) {
            fetchMonths();
        }
    }, [open, user]);

    /**
     * Fetches the list of available budget months for the current user from Firestore.
     * @async
     */
    const fetchMonths = async () => {
        setLoading(true);
        setError('');

        try {
            const monthsCollection = collection(db, `manualBudget/${user.uid}/months`);
            const monthsSnapshot = await getDocs(monthsCollection);

            // Extract month IDs and sort them in descending order (newest first)
            const monthsList = monthsSnapshot.docs.map(doc => doc.id);

            // Custom sort function for YYYY-MM format
            monthsList.sort((a, b) => {
                // Sort in descending order (newest first)
                return b.localeCompare(a);
            });

            setMonths(monthsList);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching months:', error);
            setError('Failed to load months. Please try again.');
            setLoading(false);
        }
    };

    /**
     * Handles the selection of a month from the list.
     * @param {string} month - The selected month (YYYY-MM).
     */
    const handleMonthSelect = (month) => {
        onMonthSelect(month);
        onClose();
    };

    /**
     * Handles adding the current calendar month to the budget.
     * It calls the `addNewMonth` prop function and then selects the newly added month.
     * @async
     */
    const handleAddCurrentMonth = async () => {
        setLoading(true);
        setError('');

        try {
            const success = await addNewMonth(currentCalendarMonth);

            if (success) {
                onMonthSelect(currentCalendarMonth);
                onClose();
            } else {
                // Refresh the month list
                fetchMonths();
            }
        } catch (error) {
            console.error('Error adding current month:', error);
            setError('Failed to add current month. Please try again.');
            setLoading(false);
        }
    };

    /**
     * Formats a month string from YYYY-MM to "Month YYYY" for display.
     * @param {string} monthStr - The month string in YYYY-MM format.
     * @returns {string} The formatted month string.
     */
    const formatMonth = (monthStr) => {
        try {
            const [year, month] = monthStr.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleString('default', { month: 'long', year: 'numeric' });
        } catch (e) {
            return monthStr;
        }
    };

    // Determines if the current calendar month is missing from the list of fetched budget months.
    const isCurrentMonthMissing = !months.includes(currentCalendarMonth);

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="month-selector-modal-title"
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: mode === 'light'
                            ? 'rgba(0, 0, 0, 0.5)'
                            : 'rgba(0, 0, 0, 0.7)'
                    }
                }
            }}
        >
            <Fade in={open}>
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 400 },
                        maxHeight: '80vh',
                        overflow: 'auto',
                        bgcolor: 'background.paper',
                        boxShadow: theme.shadows[10],
                        p: 3,
                        borderRadius: 2,
                        border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
                    }}
                >
                    <Typography
                        id="month-selector-modal-title"
                        variant="h6"
                        component="h2"
                        gutterBottom
                        sx={{ color: 'text.primary' }}
                    >
                        Select Month
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {isCurrentMonthMissing && !loading && (
                        <Box sx={{ mb: 2 }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAddCurrentMonth}
                                fullWidth
                            >
                                Add {formatMonth(currentCalendarMonth)}
                            </Button>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                This will copy categories and goals from your most recent month
                            </Typography>
                        </Box>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress color="primary" />
                        </Box>
                    ) : (
                        <>
                            {months.length > 0 ? (
                                <List sx={{ pt: 1 }}>
                                    {months.map((month, index) => (
                                        <React.Fragment key={month}>
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    onClick={() => handleMonthSelect(month)}
                                                    selected={month === currentMonth}
                                                    sx={{
                                                        borderRadius: 1,
                                                        '&.Mui-selected': {
                                                            backgroundColor: 'primary.main',
                                                            color: 'primary.contrastText',
                                                            '&:hover': {
                                                                backgroundColor: 'primary.dark',
                                                            },
                                                        },
                                                        '&:hover': {
                                                            backgroundColor: mode === 'light'
                                                                ? 'rgba(25, 118, 210, 0.08)'
                                                                : 'rgba(144, 202, 249, 0.08)',
                                                        },
                                                        transition: 'background-color 0.3s',
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={formatMonth(month)}
                                                        primaryTypographyProps={{
                                                            fontWeight: month === currentMonth ? 'bold' : 'normal',
                                                            color: month === currentMonth ? 'inherit' : 'text.primary',
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                            {index < months.length - 1 && (
                                                <Divider
                                                    component="li"
                                                    sx={{
                                                        borderColor: mode === 'dark'
                                                            ? 'rgba(255, 255, 255, 0.12)'
                                                            : 'rgba(0, 0, 0, 0.12)'
                                                    }}
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        py: 2,
                                        textAlign: 'center',
                                        color: 'text.secondary'
                                    }}
                                >
                                    No previous months found.
                                </Typography>
                            )}
                        </>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                            onClick={onClose}
                            sx={{ color: 'primary.main' }}
                        >
                            Close
                        </Button>
                    </Box>
                </Paper>
            </Fade>
        </Modal>
    );
}
