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

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import ExpenseListItemContent from './ExpenseListItemContent';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Style for the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh',
  overflowY: 'auto',
};

/**
 * Displays a list of expenses. Includes a modal to view itemized details.
 * @param {object} props - Component props.
 * @param {Array<object>} props.expenses - Array of expense objects.
 * @param {function} [props.onDeleteExpense] - Callback function invoked when the delete button is clicked. Receives the expense `id`.
 * @param {function} [props.onEditExpense] - Callback function invoked when the edit action is selected. Receives the expense object.
 * @param {boolean} [props.isSharedView=false] - If true, hides the delete/edit actions.
 */
export default function ExpenseList({ expenses, onDeleteExpense, onEditExpense, isSharedView = false }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedExpenseItems, setSelectedExpenseItems] = useState([]);

    const [anchorEl, setAnchorEl] = useState(null);
    const [menuExpenseId, setMenuExpenseId] = useState(null);

    const handleOpenItemsModal = (items) => {
        setSelectedExpenseItems(items || []);
        setModalOpen(true);
    };

    const handleCloseItemsModal = () => {
        setModalOpen(false);
        setSelectedExpenseItems([]);
    };

    const handleMenuOpen = (event, expenseId) => {
        setAnchorEl(event.currentTarget);
        setMenuExpenseId(expenseId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuExpenseId(null);
    };

    const handleMenuViewItems = (items) => {
        handleOpenItemsModal(items);
        handleMenuClose();
    };

    const handleMenuDelete = (expenseId) => {
        if (onDeleteExpense) {
            onDeleteExpense(expenseId);
        }
        handleMenuClose();
    };

    const handleMenuEdit = (expense) => {
        if (onEditExpense) {
            onEditExpense(expense);
        }
        handleMenuClose();
    };

    // Separate expenses by status (only when not shared)
    const pendingExpenses = isSharedView ? expenses : expenses.filter(exp => exp.status === 'pending');
    const deniedExpenses = isSharedView ? [] : expenses.filter(exp => exp.status === 'denied');
    const reimbursedExpenses = isSharedView ? [] : expenses.filter(exp => exp.status === 'reimbursed');

    // Helper function to render a list item (to avoid repetition)
    const renderListItem = (expense) => {
        const hasItems = expense.items && expense.items.length > 0;
        const canDelete = !isSharedView && onDeleteExpense;
        const canEdit = !isSharedView && onEditExpense && expense.status === 'pending';
        const showMenuButton = !isSharedView && (hasItems || canDelete || canEdit);

        return (
            <ListItem
                key={expense.id}
                secondaryAction={
                    <>
                        {showMenuButton && (
                            <IconButton
                                edge="end"
                                aria-label="actions"
                                aria-controls={`actions-menu-${expense.id}`}
                                aria-haspopup="true"
                                onClick={(e) => handleMenuOpen(e, expense.id)}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        )}
                    </>
                }
                divider
                sx={expense.status !== 'pending' ? { opacity: 0.7 } : {}}
            >
                <ExpenseListItemContent
                    expense={expense}
                    showDenialReason={!isSharedView && expense.status === 'denied'}
                    isSharedView={isSharedView} // Pass the prop down
                />
            </ListItem>
        );
    };

    return (
        <> {/* Wrap List and Modal */}
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

                        {/* Render Denied Expenses in Accordion (only if not shared view and items exist) */}
                        {!isSharedView && deniedExpenses.length > 0 && (
                            <Accordion
                                disableGutters
                                sx={{
                                    // Add margin only if pending list exists
                                    mt: pendingExpenses.length > 0 ? 2 : 0,
                                    '&:before': { display: 'none' },
                                    boxShadow: 'none',
                                    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                                    bgcolor: 'transparent',
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="denied-expenses-content"
                                    id="denied-expenses-header"
                                    // Match styling of reimbursed summary
                                    sx={{ minHeight: '48px', '& .MuiAccordionSummary-content': { my: '12px' } }}
                                >
                                    <Typography sx={{ color: 'text.secondary' }}>
                                        Denied Expenses ({deniedExpenses.length})
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    <List sx={{ p: 0 }}>
                                        {deniedExpenses.map(renderListItem)}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        )}

                        {/* Render Reimbursed Expenses in Accordion (only if not shared view and items exist) */}
                        {!isSharedView && reimbursedExpenses.length > 0 && (
                            <Accordion
                                disableGutters
                                sx={{
                                    // Add margin only if pending or denied list exists
                                    mt: (pendingExpenses.length > 0 || deniedExpenses.length > 0) ? 2 : 0,
                                    '&:before': { display: 'none' },
                                    boxShadow: 'none',
                                    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                                    bgcolor: 'transparent',
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="reimbursed-expenses-content"
                                    id="reimbursed-expenses-header"
                                    // Match styling of denied summary
                                    sx={{ minHeight: '48px', '& .MuiAccordionSummary-content': { my: '12px' } }}
                                >
                                    <Typography sx={{ color: 'text.secondary' }}>
                                        Reimbursed Expenses ({reimbursedExpenses.length})
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    <List sx={{ p: 0 }}>
                                        {reimbursedExpenses.map(renderListItem)}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        )}
                    </>
                )}
            </Box>

            {!isSharedView && (
                <Menu
                    id={`actions-menu-${menuExpenseId}`}
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl && menuExpenseId)}
                    onClose={handleMenuClose}
                    MenuListProps={{
                        'aria-labelledby': 'actions-button',
                    }}
                >
                    {(() => {
                        const currentExpense = expenses.find(exp => exp.id === menuExpenseId);
                        if (!currentExpense) return null;

                        const menuItems = [];
                        if (currentExpense.items && currentExpense.items.length > 0) {
                            menuItems.push(
                                <MenuItem key="view-items" onClick={() => handleMenuViewItems(currentExpense.items)}>
                                    <InfoIcon sx={{ mr: 1 }} fontSize="small" /> View Items
                                </MenuItem>
                            );
                        }
                        if (onEditExpense && currentExpense.status === 'pending') {
                            menuItems.push(
                                <MenuItem key="edit" onClick={() => handleMenuEdit(currentExpense)}>
                                    <EditIcon sx={{ mr: 1 }} fontSize="small" /> Edit
                                </MenuItem>
                            );
                        }
                        if (onDeleteExpense) {
                            menuItems.push(
                                <MenuItem key="delete" onClick={() => handleMenuDelete(currentExpense.id)} sx={{ color: 'error.main' }}>
                                    <DeleteIcon sx={{ mr: 1 }} fontSize="small" /> Delete
                                </MenuItem>
                            );
                        }
                        if (menuItems.length === 0) {
                            return <MenuItem disabled>No actions available</MenuItem>;
                        }

                        return menuItems;
                    })()}
                </Menu>
            )}

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
                                            primary={item.description || '(No description)'}
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
        </>
    );
}
