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
import { useParams } from 'react-router-dom';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import AppAppBar from '../components/AppAppBar'; // Reuse AppAppBar for consistent look
import Footer from '../components/Footer'; // Reuse Footer
import ExpenseList from '../components/ExpenseReport/ExpenseList'; // Reuse ExpenseList
import { useTitle } from '../components/useTitle';
// Import Firebase functions callable
import { getFunctions, httpsCallable } from "firebase/functions";
import { initializeApp } from "firebase/app"; // Need to initialize minimal app for functions

// Minimal Firebase config (only needs projectId if functions region is default)
// Or provide the full config if needed.
const firebaseConfig = {
  apiKey: "AIzaSyCNWHnPGjQlu4Dt-WFJsGej11O9tnP9HuI", // May not be strictly needed for functions call
  authDomain: "thejunkyard-b1858.firebaseapp.com",
  projectId: "thejunkyard-b1858",
  // storageBucket: "thejunkyard-b1858.appspot.com", // Not needed here
  // messagingSenderId: "66694016123", // Not needed here
  // appId: "1:66694016123:web:1c659a2c06d31c5a7b86de" // Not needed here
};

// Initialize a minimal Firebase app instance specifically for this page if not using context
// This page doesn't need AuthContext as it's public
let app;
try {
    // Check if Firebase app named '[DEFAULT]' already exists
    const existingApp = initializeApp(firebaseConfig, 'temp-shared-expense-app'); // Use a temporary name
    app = existingApp;
    // If you need to ensure you always get the default app instance if it exists:
    // app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
    if (/already exists/.test(e.message)) {
        // If default app exists, get it. Otherwise, handle the error.
        try {
            app = initializeApp(firebaseConfig); // Attempt to get default if initialization failed due to existing default
        } catch (defaultError) {
             console.error("Firebase initialization error on shared page (fallback):", defaultError);
             // Handle error appropriately, maybe show an error message
        }
    } else {
        console.error("Firebase initialization error on shared page:", e);
        // Handle other initialization errors
    }
}


export default function SharedExpenseReport({ mode, setMode }) {
    useTitle('theJunkyard: Shared Expense Report');
    const { shareId } = useParams(); // Get shareId from URL
    const defaultTheme = createTheme({ palette: { mode } });
    const functions = app ? getFunctions(app) : null; // Initialize Firebase Functions

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedExpenses, setSelectedExpenses] = useState(new Set());
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [denialReasonModalOpen, setDenialReasonModalOpen] = useState(false);
    const [denialReason, setDenialReason] = useState('');

    // Fetch expenses on component mount or when shareId changes
    useEffect(() => {
        const fetchExpenses = async () => {
            if (!shareId || !functions) {
                setError("Invalid share link or functions not initialized.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            setExpenses([]); // Clear previous expenses
            setSelectedExpenses(new Set()); // Reset selection

            try {
                const getSharedExpensesFunction = httpsCallable(functions, 'getSharedExpenses');
                const result = await getSharedExpensesFunction({ shareId });
                // Ensure status defaults are applied if missing from backend data
                const fetched = result.data.expenses.map(exp => ({
                    ...exp,
                    status: exp.status || 'pending',
                    denialReason: exp.denialReason || null,
                }));
                setExpenses(fetched);
            } catch (err) {
                console.error("Error fetching shared expenses:", err);
                setError(`Failed to load expenses: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, [shareId, functions]); // Rerun if shareId or functions instance changes

    // Handle selection change
    const handleSelect = (expenseId) => {
        setSelectedExpenses(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(expenseId)) {
                newSelected.delete(expenseId);
            } else {
                newSelected.add(expenseId);
            }
            return newSelected;
        });
    };

    // Handle select all / deselect all for pending items
    const handleSelectAllPending = () => {
        const pendingIds = expenses
            .filter(exp => exp.status === 'pending')
            .map(exp => exp.id);

        // If all pending are already selected, deselect all. Otherwise, select all pending.
        const allPendingSelected = pendingIds.length > 0 && pendingIds.every(id => selectedExpenses.has(id));

        if (allPendingSelected) {
            setSelectedExpenses(new Set()); // Deselect all
        } else {
            setSelectedExpenses(new Set(pendingIds)); // Select all pending
        }
    };


    // --- Update Logic ---
    const performUpdate = async (action, reason = null) => {
        if (selectedExpenses.size === 0) {
            setUpdateError("Please select at least one expense to update.");
            return;
        }
        if (!functions) {
             setUpdateError("Functions not available.");
             return;
        }

        setUpdating(true);
        setUpdateError('');
        setUpdateSuccess('');

        const expenseIdsToUpdate = Array.from(selectedExpenses);

        try {
            const updateStatusFunction = httpsCallable(functions, 'updateSharedExpenseStatus');
            const result = await updateStatusFunction({
                shareId,
                expenseIds: expenseIdsToUpdate,
                action,
                reason: action === 'deny' ? reason : null,
            });

            if (result.data.success) {
                setUpdateSuccess(`Successfully updated ${result.data.updatedCount} expense(s) to '${action}'.`);
                // Refresh expenses list after successful update
                const getSharedExpensesFunction = httpsCallable(functions, 'getSharedExpenses');
                const refreshResult = await getSharedExpensesFunction({ shareId });
                 const refreshed = refreshResult.data.expenses.map(exp => ({
                    ...exp,
                    status: exp.status || 'pending',
                    denialReason: exp.denialReason || null,
                }));
                setExpenses(refreshed);
                setSelectedExpenses(new Set()); // Clear selection after update
            } else {
                throw new Error("Update failed on the server.");
            }
        } catch (err) {
            console.error(`Error updating expenses to ${action}:`, err);
            setUpdateError(`Failed to update expenses: ${err.message}`);
        } finally {
            setUpdating(false);
            setDenialReasonModalOpen(false); // Close modal if open
            setDenialReason(''); // Clear reason
        }
    };

    const handleMarkReimbursed = () => {
        performUpdate('reimburse');
    };

    const handleOpenDenialModal = () => {
        if (selectedExpenses.size === 0) {
            setUpdateError("Please select at least one expense to mark as denied.");
            return;
        }
        setDenialReasonModalOpen(true);
    };

    const handleConfirmDenial = () => {
        performUpdate('deny', denialReason);
    };

    const handleCloseDenialModal = () => {
        setDenialReasonModalOpen(false);
        setDenialReason('');
    };

    // Calculate counts for UI
    const pendingExpenses = expenses.filter(exp => exp.status === 'pending');
    const allPendingSelected = pendingExpenses.length > 0 && pendingExpenses.every(id => selectedExpenses.has(id.id));
    const somePendingSelected = pendingExpenses.some(id => selectedExpenses.has(id.id));

    return (
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            {/* Pass dummy toggle function if setMode is not passed */}
            <AppAppBar mode={mode} toggleColorMode={setMode || (() => {})} showAuthButtons={false} />
            <Box
                sx={(theme) => ({
                    width: '100%',
                    backgroundImage:
                        theme.palette.mode === 'light'
                            ? 'linear-gradient(180deg, #CEE5FD, #FFF)'
                            : `linear-gradient(#02294F, ${alpha(theme.palette.background.default, 0.0)})`, // Use theme background
                    backgroundSize: '100% 10%',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '100vh', // Ensure Box takes full height
                    display: 'flex', // Enable flex container
                    flexDirection: 'column', // Stack children vertically
                })}
            >
                <Container maxWidth="lg" sx={{ pt: { xs: 12, sm: 15 }, flexGrow: 1 }}> {/* Allow container to grow */}
                    <Typography variant='h4' gutterBottom>Shared Expense Report</Typography>

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {error && <Alert severity="error">{error}</Alert>}

                    {!loading && !error && (
                        <>
                            {/* Action Buttons */}
                            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleMarkReimbursed}
                                    disabled={updating || selectedExpenses.size === 0}
                                >
                                    Mark Selected Reimbursed
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleOpenDenialModal}
                                    disabled={updating || selectedExpenses.size === 0}
                                >
                                    Mark Selected Denied
                                </Button>
                            </Box>

                            {/* Update Status Messages */}
                            {updating && <CircularProgress size={20} sx={{ mr: 1 }} />}
                            {updateError && <Alert severity="error" sx={{ my: 1 }}>{updateError}</Alert>}
                            {updateSuccess && <Alert severity="success" sx={{ my: 1 }}>{updateSuccess}</Alert>}

                            {/* Expense List with Checkboxes */}
                             <Box sx={{ p: 2, border: '1px dashed grey', mb: 3, bgcolor: 'background.paper' }}> {/* Add background color */}
                                <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 1 }}>
                                     <Checkbox
                                        indeterminate={somePendingSelected && !allPendingSelected}
                                        checked={allPendingSelected}
                                        onChange={handleSelectAllPending}
                                        disabled={updating || pendingExpenses.length === 0}
                                        inputProps={{ 'aria-label': 'select all pending expenses' }}
                                    />
                                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                        Expenses ({pendingExpenses.length} Pending)
                                    </Typography>
                                </Box>

                                {expenses.length === 0 ? (
                                    <Typography>No expenses found for this report.</Typography>
                                ) : (
                                    <List sx={{ p: 0 }}> {/* Remove padding from List */}
                                        {expenses.map((expense) => (
                                            <ListItem
                                                key={expense.id}
                                                // Make list item clickable only for pending items
                                                button={expense.status === 'pending'}
                                                onClick={expense.status === 'pending' ? () => handleSelect(expense.id) : undefined}
                                                disabled={updating}
                                                divider
                                                sx={{ p: 0 }} // Remove padding from ListItem
                                            >
                                                <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, pl: 1 }}> {/* Adjust padding */}
                                                    {/* Only show checkbox for pending items */}
                                                    {expense.status === 'pending' ? (
                                                        <Checkbox
                                                            edge="start"
                                                            checked={selectedExpenses.has(expense.id)}
                                                            tabIndex={-1}
                                                            disableRipple
                                                            inputProps={{ 'aria-labelledby': `expense-label-${expense.id}` }}
                                                            disabled={updating}
                                                        />
                                                    ) : (
                                                        // Placeholder or different icon for non-pending
                                                        <Box sx={{ width: 42 }} /> // Match checkbox width roughly
                                                    )}
                                                </ListItemIcon>
                                                {/* Use ExpenseList component internally for consistent display */}
                                                {/* We pass a single expense in an array to reuse its rendering logic */}
                                                {/* We set isSharedView to prevent delete button */}
                                                {/* Remove the outer Box from ExpenseList to avoid double borders/padding */}
                                                <Box sx={{ flexGrow: 1, '& > div': { border: 'none', p: 0, mb: 0 } }}> {/* Target inner Box */}
                                                    <ExpenseList
                                                        expenses={[expense]} // Pass single expense as array
                                                        isSharedView={true} // Indicate shared context
                                                    />
                                                </Box>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        </>
                    )}
                </Container>
                <Footer /> {/* Footer at the bottom */}
            </Box>

            {/* Denial Reason Modal */}
            <Dialog open={denialReasonModalOpen} onClose={handleCloseDenialModal}>
                <DialogTitle>Denial Reason (Optional)</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please provide a brief reason for denying the selected expense(s).
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="denial-reason"
                        label="Reason"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={denialReason}
                        onChange={(e) => setDenialReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDenialModal}>Cancel</Button>
                    <Button onClick={handleConfirmDenial} color="error">Confirm Denial</Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}
