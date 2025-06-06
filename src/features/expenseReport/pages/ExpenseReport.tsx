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

import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import PageLayout from '../../../components/layout/PageLayout';
import { useTitle } from '../../../hooks/useTitle';
import { useAuth } from '../../../contexts/AuthContext';
import LoginPrompt from '../../../components/common/LoginPrompt';
import LoginModal from '../../../features/authentication/components/LoginModal';
import SignUpModal from '../../../features/authentication/components/SignUpModal';
import CircularProgress from '@mui/material/CircularProgress';
import useExpenseReportModals from '../hooks/useExpenseReportModals';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseTotal from '../components/ExpenseTotal';
import ShareLinkManager from '../components/ShareLinkManager';
import useExpenseReportService from '../hooks/useExpenseReportService';
import { useShareLink } from '../hooks/useShareLink';
import EditExpenseModal from '../components/EditExpenseModal';
import Alert from '@mui/material/Alert';
import { ExpenseReportProps, Expense } from '../types';

const ExpenseReport: React.FC<ExpenseReportProps> = ({ setMode, mode }) => {
    useTitle('theJunkyard: Expense Report');
    const { activeUser, loading: authLoading, app } = useAuth();

    // Use custom hooks with proper type handling
    const expenseService = useExpenseReportService() as any;
    const expenses = expenseService?.expenses ?? [];
    const loadingExpenses = expenseService?.loadingExpenses ?? false;
    const addExpense = expenseService?.addExpense ?? (async () => {});
    const deleteExpense = expenseService?.deleteExpense ?? (async () => {});
    const updateExpense = expenseService?.updateExpense ?? (async () => {});
    const deleteStorageFile = expenseService?.deleteStorageFile ?? (async () => {});
    const totalPendingAmount = expenseService?.totalPendingAmount ?? 0;

    const shareLinkService = useShareLink() as any;
    const shareLink = shareLinkService?.shareLink ?? '';
    const generateLink = shareLinkService?.generateLink ?? (async () => {});
    const generatingLink = shareLinkService?.generatingLink ?? false;
    const linkError = shareLinkService?.linkError ?? '';
    const copyToClipboard = shareLinkService?.copyToClipboard ?? (() => {});
    const copied = shareLinkService?.copied ?? false;

    // Modal hooks managed by useExpenseReportModals
    const {
        loginModal,
        signUpModal,
        editExpenseModal
    } = useExpenseReportModals();

    // State for Edit Modal - updateError remains here as it's specific to the save operation
    const [updateError, setUpdateError] = useState<string>('');

    // State for Action Menu
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [menuExpenseId, setMenuExpenseId] = useState<string | null>(null);

    // Handlers for Edit Modal
    const handleOpenEditModal = (expense: Expense): void => {
        editExpenseModal.open(expense);
        setUpdateError(''); // Clear error when opening
    };

    const handleCloseEditModal = (): void => {
        editExpenseModal.close();
        setUpdateError(''); // Clear error when closing
    };

    const handleSaveEdit = async (expenseId: string, updatedData: Partial<Expense>): Promise<void> => {
        setUpdateError('');
        try {
            await updateExpense(expenseId, updatedData);
            handleCloseEditModal();
        } catch (error) {
            console.error("Failed to update expense:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setUpdateError(`Failed to save changes: ${errorMessage}`);
        }
    };

    // Menu Handlers
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, expenseId: string): void => {
        setAnchorEl(event.currentTarget);
        setMenuExpenseId(expenseId);
    };

    // Only set anchorEl to null to start the closing animation
    const handleMenuClose = (): void => {
        setAnchorEl(null);
    };

    // New handler to reset menuExpenseId after the menu has fully closed
    const handleMenuExited = useCallback((): void => {
        setMenuExpenseId(null);
    }, []);

    /**
     * Handles updating the status of an expense.
     * @param expenseId - The ID of the expense to update.
     * @param newStatus - The new status ('pending', 'approved', 'denied', 'reimbursed').
     */
    const handleUpdateStatus = async (expenseId: string, newStatus: Expense['status']): Promise<void> => {
        setUpdateError(''); // Clear previous errors
        console.log(`Updating status for ${expenseId} to ${newStatus}`);
        try {
            // Prepare payload - clear denial reason if not denying
            const payload: Partial<Expense> = {
                status: newStatus,
                denialReason: newStatus === 'denied' ? 'Manually Denied' : undefined,
                processedAt: newStatus !== 'pending' ? new Date() : undefined, // Set processed time if not pending
            };
            // Note: The updateExpense hook should handle setting updatedAt
            await updateExpense(expenseId, payload);
        } catch (error) {
            console.error(`Failed to update status for expense ${expenseId}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setUpdateError(`Failed to update status: ${errorMessage}`);
        }
        // Note: No need to manually refresh data, useExpenseReportService hook handles updates
    };

    return (
        <PageLayout mode={mode} setMode={setMode} sx={{}}>
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
                                onUpdateStatus={handleUpdateStatus}
                                handleMenuOpen={handleMenuOpen}
                                handleMenuClose={handleMenuClose}
                                anchorEl={anchorEl}
                                menuExpenseId={menuExpenseId}
                                handleMenuExited={handleMenuExited}
                            />
                        )}

                        <ExpenseTotal totalAmount={totalPendingAmount} />
                        <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                            (Total includes pending expenses only)
                        </Typography>
                    </Box>
                ) : (
                    <LoginPrompt
                        openLoginModal={loginModal.open}
                        openSignUpModal={signUpModal.open}
                        loading={authLoading}
                        user={activeUser}
                        app_title="Expense Report"
                    />
                )}
            </Container>
            {/* Modals are kept outside the main content, but within PageLayout's ThemeProvider scope */}
            <LoginModal
                open={loginModal.isOpen || false}
                onClose={loginModal.close}
                app={app}
            />
            <SignUpModal
                open={signUpModal.isOpen || false}
                onClose={signUpModal.close}
                app={app}
            />

            <EditExpenseModal
                open={editExpenseModal.isOpen}
                onClose={handleCloseEditModal} // Keep original close to also clear updateError
                expense={editExpenseModal.expenseToEdit}
                onSave={handleSaveEdit}
            />
        </PageLayout>
    );
};

export default ExpenseReport;
