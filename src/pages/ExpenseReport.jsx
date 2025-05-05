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

import * as React from 'react';
import { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AppAppBar from '../components/AppAppBar';
import Footer from '../components/Footer';
import { useTitle } from '../components/useTitle';
import { useAuth } from '../contexts/AuthContext';
import LoginPrompt from '../components/ManualBudget/LoginPrompt';
import useModal from '../hooks/useModal';
import LoginModal from '../components/Authentication/LoginModal';
import SignUpModal from '../components/Authentication/SignUpModal';
import CircularProgress from '@mui/material/CircularProgress';
import ExpenseForm from '../components/ExpenseReport/ExpenseForm';
import ExpenseList from '../components/ExpenseReport/ExpenseList';
import ExpenseTotal from '../components/ExpenseReport/ExpenseTotal';
import ShareLinkManager from '../components/ExpenseReport/ShareLinkManager';
import { useUserExpenses } from '../hooks/useUserExpenses';
import { useShareLink } from '../hooks/useShareLink';
import EditExpenseModal from '../components/ExpenseReport/EditExpenseModal';
import Alert from '@mui/material/Alert';

export default function ExpenseReport({ setMode, mode }) {
    useTitle('theJunkyard: Expense Report');
    const defaultTheme = createTheme({ palette: { mode } });
    const { activeUser, loading: authLoading } = useAuth();

    // Use custom hooks
    const {
        expenses,
        loadingExpenses,
        addExpense,
        deleteExpense,
        updateExpense,
        deleteStorageFile,
        totalPendingAmount
    } = useUserExpenses();

    const {
        shareLink,
        generateLink,
        generatingLink,
        linkError,
        copyToClipboard,
        copied
    } = useShareLink();

    // Modal hooks
    const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
    const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);

    // State for Edit Modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState(null);
    const [updateError, setUpdateError] = useState('');

    // Handlers for Edit Modal
    const handleOpenEditModal = (expense) => {
        if (expense.status === 'pending') {
            setExpenseToEdit(expense);
            setEditModalOpen(true);
            setUpdateError('');
        } else {
            console.warn("Cannot edit expenses that are not pending.");
        }
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setExpenseToEdit(null);
        setUpdateError('');
    };

    const handleSaveEdit = async (expenseId, updatedData) => {
        setUpdateError('');
        try {
            await updateExpense(expenseId, updatedData);
            handleCloseEditModal();
        } catch (error) {
            console.error("Failed to update expense:", error);
            setUpdateError(`Failed to save changes: ${error.message}`);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <AppAppBar
                mode={mode}
                toggleColorMode={setMode}
                openLoginModal={openLoginModal}
                openSignUpModal={openSignUpModal}
            />
            <Box
                sx={(theme) => ({
                    width: '100%',
                    backgroundImage:
                        theme.palette.mode === 'light'
                            ? 'linear-gradient(180deg, #CEE5FD, #FFF)'
                            : `linear-gradient(#02294F, ${alpha('#090E10', 0.0)})`,
                    backgroundSize: '100% 10%',
                    backgroundRepeat: 'no-repeat',
                })}
            >
                <Container maxWidth="lg" sx={{ pt: { xs: 12, sm: 15 }, minHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant='h2'
                        sx={{
                            mb: 2,
                            display: { xs: 'flex', sm: 'flex' },
                            flexDirection: { xs: 'column', md: 'row' },
                            alignSelf: 'left',
                            textAlign: 'left',
                            fontSize: { xs: 'clamp(3.4rem, 10vw, 4rem)', sm: 'clamp(3.5rem, 10vw, 4rem)' },
                            fontWeight: 'bold',
                        }}>
                        Expense Report
                    </Typography>

                    {authLoading ? (
                         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                            <CircularProgress />
                        </Box>
                    ) : activeUser ? (
                        <Box sx={{ flexGrow: 1 }}>
                            <ShareLinkManager
                                shareLink={shareLink}
                                generateLink={generateLink}
                                generatingLink={generatingLink}
                                linkError={linkError}
                                copyToClipboard={copyToClipboard}
                                copied={copied}
                                disabled={!activeUser}
                            />

                            <ExpenseForm
                                onAddExpense={addExpense}
                                onDeleteStorageFile={deleteStorageFile}
                            />

                            {updateError && <Alert severity="error" sx={{ mb: 2 }}>{updateError}</Alert>}

                            {loadingExpenses ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <ExpenseList
                                    expenses={expenses}
                                    onDeleteExpense={deleteExpense}
                                    onEditExpense={handleOpenEditModal}
                                />
                            )}

                            <ExpenseTotal totalAmount={totalPendingAmount} />
                            <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                                (Total includes pending expenses only)
                            </Typography>
                        </Box>
                    ) : (
                        <LoginPrompt
                            openLoginModal={openLoginModal}
                            openSignUpModal={openSignUpModal}
                            loading={authLoading}
                            user={activeUser}
                            app_title="Expense Report"
                        />
                    )}
                </Container>
                <Footer />
            </Box>

            <LoginModal
                open={loginModalOpen || false}
                onClose={closeLoginModal}
            />
            <SignUpModal
                open={signUpModalOpen || false}
                onClose={closeSignUpModal}
            />

            <EditExpenseModal
                open={editModalOpen}
                onClose={handleCloseEditModal}
                expense={expenseToEdit}
                onSave={handleSaveEdit}
            />
        </ThemeProvider>
    );
}
