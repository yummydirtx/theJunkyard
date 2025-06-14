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

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import ExpenseTotal from '../components/ExpenseTotal';
import { useTitle } from '../../../hooks/useTitle';
import { getFunctions, Functions } from "firebase/functions";
import { useSharedExpenses } from '../hooks/useSharedExpenses';
import SharedExpenseActions from '../components/SharedExpenseActions';
import DenialReasonModal from '../components/DenialReasonModal';
import ExpenseListItemContent from '../components/ExpenseListItemContent';
import Modal from '@mui/material/Modal';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import ListItemText from '@mui/material/ListItemText';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import PageLayout from '../../../components/layout/PageLayout';
import { ExpenseItem, SharedExpenseReportProps } from '../types';
import app from '../../../services/firebase/config';

const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '80vh',
    overflowY: 'auto' as const,
};

/**
 * SharedExpenseReport component displays a list of expenses from a shared report.
 * It allows users with the link to view expenses and, if they have appropriate permissions (handled server-side),
 * mark expenses as reimbursed or denied.
 */
export default function SharedExpenseReport({ mode, setMode }: SharedExpenseReportProps): React.JSX.Element {
    useTitle('theJunkyard: Shared Expense Report');
    const { shareId } = useParams<{ shareId: string }>();
    const defaultTheme = createTheme({ palette: { mode } });
    const functions: Functions | null = app ? getFunctions(app) : null;

    // Only call useSharedExpenses if we have both shareId and functions
    const {
        expenses,
        loading,
        error,
        selectedExpenses,
        handleSelect,
        pendingExpenses,
        handleSelectAllPending,
        updating,
        updateError,
        updateSuccess,
        markReimbursed,
        openDenialModal,
        denialReasonModalOpen,
        denialReason,
        setDenialReason,
        confirmDenial,
        closeDenialModal,
        displayedTotalAmount
    } = useSharedExpenses(shareId || '', functions!);

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedExpenseItems, setSelectedExpenseItems] = useState<ExpenseItem[]>([]);
    const [expensesOpen, setExpensesOpen] = useState<boolean>(true);

    /**
     * Opens the modal to display the detailed items of a selected expense.
     */
    const handleOpenItemsModal = (items: ExpenseItem[] | undefined): void => {
        setSelectedExpenseItems(items || []);
        setModalOpen(true);
    };

    /**
     * Closes the expense items modal and clears the selected items.
     */
    const handleCloseItemsModal = (): void => {
        setModalOpen(false);
        setSelectedExpenseItems([]);
    };

    // Memoized value to determine if all pending expenses are currently selected.
    // Used for the "select all" checkbox state.
    const allPendingSelected = useMemo((): boolean =>
        pendingExpenses.length > 0 && pendingExpenses.every(exp => selectedExpenses.has(exp.id)),
        [pendingExpenses, selectedExpenses]
    );
    
    // Memoized value to determine if some (but not all) pending expenses are selected.
    // Used for the "select all" checkbox indeterminate state.
    const somePendingSelected = useMemo((): boolean =>
        pendingExpenses.some(exp => selectedExpenses.has(exp.id)) && !allPendingSelected,
        [pendingExpenses, selectedExpenses, allPendingSelected]
    );

    return (
        <PageLayout mode={mode} setMode={setMode} sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Container maxWidth="lg" sx={{ pt: { xs: 12, sm: 15 }, flexGrow: 1 }}>
                <Typography variant='h2'
                    sx={{
                        mb: 2,
                        fontWeight: 'bold',
                    }}>
                    Shared Expense Report
                </Typography>

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <CircularProgress />
                    </Box>
                )}
                {error && <Alert severity="error">{error}</Alert>}

                {!loading && !error && (
                    <>
                        <SharedExpenseActions
                            updating={updating}
                            updateError={updateError}
                            updateSuccess={updateSuccess}
                            onMarkReimbursed={markReimbursed}
                            onOpenDenialModal={openDenialModal}
                            selectedCount={selectedExpenses.size}
                        />

                        <Box sx={{ p: 2, border: '1px dashed grey', mb: 3, bgcolor: 'background.paper' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 1 }}>
                                <Checkbox
                                    indeterminate={somePendingSelected}
                                    checked={allPendingSelected}
                                    onChange={handleSelectAllPending}
                                    disabled={updating || pendingExpenses.length === 0}
                                    slotProps={{ input: { 'aria-label': 'select all pending expenses' } }}
                                />
                                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                    Expenses ({pendingExpenses.length} Pending)
                                </Typography>
                                <IconButton
                                    onClick={() => setExpensesOpen(!expensesOpen)}
                                    aria-label={expensesOpen ? 'collapse expenses' : 'expand expenses'}
                                >
                                    {expensesOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </IconButton>
                            </Box>

                            <Collapse in={expensesOpen} timeout="auto" unmountOnExit>
                                <>
                                    {expenses.length === 0 ? (
                                        <Typography>No expenses found for this report.</Typography>
                                    ) : (
                                        <List sx={{ p: 0 }}>
                                            {expenses.map((expense) => {
                                                const commonItemProps = {
                                                    disabled: updating,
                                                    divider: true,
                                                    sx: { p: 0, alignItems: 'flex-start' }
                                                };
                                                const isSelected = selectedExpenses.has(expense.id);

                                                const listItemContent = (
                                                    <>
                                                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, pl: 1, pt: 1.5 }}>
                                                            {expense.status === 'pending' ? (
                                                                <Checkbox
                                                                    edge="start"
                                                                    checked={isSelected}
                                                                    tabIndex={-1}
                                                                    disableRipple
                                                                    slotProps={{ input: { 'aria-labelledby': `expense-label-${expense.id}` } }}
                                                                    disabled={updating}
                                                                />
                                                            ) : (
                                                                <Box sx={{ width: 42, height: 42 }} />
                                                            )}
                                                        </ListItemIcon>
                                                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', pt: 1, pb: 1, pr: 1 }}>
                                                            <ExpenseListItemContent
                                                                expense={expense}
                                                                showDenialReason={false}
                                                                isSharedView={true}
                                                            />
                                                            {expense.items && expense.items.length > 0 && (
                                                                <IconButton
                                                                    edge="end"
                                                                    aria-label="view items"
                                                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => { 
                                                                        e.stopPropagation(); 
                                                                        handleOpenItemsModal(expense.items); 
                                                                    }}
                                                                    sx={{ ml: 'auto' }}
                                                                    disabled={updating}
                                                                >
                                                                    <InfoIcon />
                                                                </IconButton>
                                                            )}
                                                        </Box>
                                                    </>
                                                );

                                                return expense.status === 'pending' ? (
                                                    <ListItemButton
                                                        key={expense.id}
                                                        {...commonItemProps}
                                                        onClick={() => handleSelect(expense.id)}
                                                        selected={isSelected}
                                                        sx={{ ...commonItemProps.sx, display: 'flex' }}
                                                    >
                                                        {listItemContent}
                                                    </ListItemButton>
                                                ) : (
                                                    <ListItem
                                                        key={expense.id}
                                                        {...commonItemProps}
                                                        sx={{ ...commonItemProps.sx, display: 'flex', opacity: 0.6 }}
                                                    >
                                                        {listItemContent}
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    )}
                                </>
                            </Collapse>
                        </Box>

                        {expenses.length > 0 && (
                            <ExpenseTotal totalAmount={displayedTotalAmount} />
                        )}
                    </>
                )}
            </Container>

            <Modal
                open={modalOpen}
                onClose={handleCloseItemsModal}
                aria-labelledby="expense-items-modal-title"
                aria-describedby="expense-items-modal-description"
            >
                <Box sx={modalStyle}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography id="expense-items-modal-title" variant="h6" component="h2">
                            Expense Items
                        </Typography>
                        <IconButton onClick={handleCloseItemsModal} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <List dense id="expense-items-modal-description">
                        {selectedExpenseItems.length > 0 ? (
                            selectedExpenseItems.map((item, index) => (
                                <React.Fragment key={index}>
                                    <ListItem disableGutters>
                                        <ListItemText
                                            primary={item.description || item.name || '(No description)'}
                                            secondary={item.price !== undefined ? `$${item.price.toFixed(2)}` : null}
                                        />
                                    </ListItem>
                                    {index < selectedExpenseItems.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText primary="No item details available." />
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Modal>

            <DenialReasonModal
                open={denialReasonModalOpen}
                onClose={closeDenialModal}
                reason={denialReason}
                onReasonChange={setDenialReason}
                onConfirm={confirmDenial}
            />
        </PageLayout>
    );
}