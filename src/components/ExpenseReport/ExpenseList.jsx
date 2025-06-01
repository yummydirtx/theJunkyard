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

import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import ExpenseAccordion from './ExpenseList/ExpenseAccordion';
import ExpenseActionMenu from './ExpenseList/ExpenseActionMenu';
import ExpenseItemsModal from './ExpenseList/ExpenseItemsModal';
import ExpenseListItemContent from './ExpenseListItemContent';

/**
 * Displays a list of expenses, organizing them into pending, denied, and reimbursed sections.
 * Uses sub-components for modal, action menu, and accordions.
 * @param {object} props - Component props.
 * @param {Array<object>} props.expenses - Array of expense objects.
 * @param {function} [props.onDeleteExpense] - Callback function invoked when the delete button is clicked. Receives the expense `id`.
 * @param {function} [props.onEditExpense] - Callback function invoked when the edit action is selected. Receives the expense object.
 * @param {function} [props.onUpdateStatus] - Callback function invoked when a status change action is selected. Receives (expenseId, newStatus).
 * @param {boolean} [props.isSharedView=false] - If true, hides the delete/edit actions and accordion structure.
 * @param {function} props.handleMenuOpen - Function to open the action menu.
 * @param {function} props.handleMenuClose - Function to close the action menu.
 * @param {function} props.handleMenuExited - Function called after menu closes.
 * @param {HTMLElement | null} props.anchorEl - Anchor element for the menu.
 * @param {string | null} props.menuExpenseId - ID of the expense for the open menu.
 */
export default function ExpenseList({
    expenses,
    onDeleteExpense,
    onEditExpense,
    onUpdateStatus,
    isSharedView = false,
    // Receive menu state and handlers from parent
    handleMenuOpen,
    handleMenuClose,
    handleMenuExited,
    anchorEl,
    menuExpenseId
}) {
    // State for Item Details Modal (remains local)
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedExpenseItems, setSelectedExpenseItems] = useState([]);

    // Modal Handlers (remain the same)
    const handleOpenItemsModal = (items) => {
        setSelectedExpenseItems(items || []);
        setModalOpen(true);
    };
    const handleCloseItemsModal = () => {
        setModalOpen(false);
        setSelectedExpenseItems([]);
    };

    // Separate expenses by status (only when not shared)
    const pendingExpenses = isSharedView ? expenses : expenses.filter(exp => exp.status === 'pending');
    const deniedExpenses = isSharedView ? [] : expenses.filter(exp => exp.status === 'denied');
    const reimbursedExpenses = isSharedView ? [] : expenses.filter(exp => exp.status === 'reimbursed');

    // Helper function to render a list item (passed to Accordion and used directly)
    const renderListItem = (expense) => {
        const hasItems = expense.items && expense.items.length > 0;
        const canDelete = !isSharedView && onDeleteExpense;
        const canEdit = !isSharedView && onEditExpense && expense.status === 'pending';
        const showMenuButton = !isSharedView && (hasItems || canDelete || canEdit);

        return (
            <ListItem
                key={expense.id}
                secondaryAction={
                    showMenuButton ? (
                        <IconButton
                            edge="end"
                            aria-label="actions"
                            aria-controls={`actions-menu-${expense.id}`}
                            aria-haspopup="true"
                            // Use the passed-in handler
                            onClick={(e) => handleMenuOpen(e, expense.id)}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    ) : null
                }
                divider
                sx={expense.status !== 'pending' ? { opacity: 0.7 } : {}}
            >
                <ExpenseListItemContent
                    expense={expense}
                    // Show denial reason inline only for denied items in the non-shared view
                    showDenialReason={!isSharedView && expense.status === 'denied'}
                    isSharedView={isSharedView}
                />
            </ListItem>
        );
    };

    return (
        <> {/* Wrap List and Modals/Menus */}
            <Box sx={{ p: 2, border: '1px dashed grey', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {isSharedView ? 'Expenses for Review' : 'Expense Log'}
                </Typography>
                {expenses.length === 0 ? (
                    <Typography>No expenses found.</Typography>
                ) : (
                    <>
                        {/* Render Pending Expenses directly */}
                        <List sx={{ p: 0 }}>
                            {pendingExpenses.length === 0 && !isSharedView && (
                                <Typography sx={{ p: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                                    No pending expenses.
                                </Typography>
                            )}
                            {pendingExpenses.map(renderListItem)}
                        </List>

                        {/* Render Denied Expenses in Accordion */}
                        {!isSharedView && (
                            <ExpenseAccordion
                                title="Denied Expenses"
                                count={deniedExpenses.length}
                                expenses={deniedExpenses}
                                renderItem={renderListItem}
                                addTopMargin={pendingExpenses.length > 0}
                            />
                        )}

                        {/* Render Reimbursed Expenses in Accordion */}
                        {!isSharedView && (
                            <ExpenseAccordion
                                title="Reimbursed Expenses"
                                count={reimbursedExpenses.length}
                                expenses={reimbursedExpenses}
                                renderItem={renderListItem}
                                addTopMargin={pendingExpenses.length > 0 || deniedExpenses.length > 0}
                            />
                        )}
                    </>
                )}
            </Box>

            {/* Action Menu Component */}
            {!isSharedView && (
                <ExpenseActionMenu
                    // Pass down state and handlers from parent
                    anchorEl={anchorEl}
                    menuExpenseId={menuExpenseId}
                    expenses={expenses}
                    onClose={handleMenuClose} // Pass the close handler
                    onExited={handleMenuExited} // Pass the exited handler
                    onViewItems={handleOpenItemsModal}
                    onEdit={onEditExpense}
                    onDelete={onDeleteExpense}
                    onUpdateStatus={onUpdateStatus}
                    canEdit={!isSharedView && !!onEditExpense}
                    canDelete={!isSharedView && !!onDeleteExpense}
                />
            )}

            {/* Item Details Modal Component */}
            <ExpenseItemsModal
                open={modalOpen}
                onClose={handleCloseItemsModal}
                items={selectedExpenseItems}
            />
        </>
    );
}
