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

import React, { useState } from 'react'; // Added useState
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info'; // Icon for viewing items
import Typography from '@mui/material/Typography';
import DescriptionIcon from '@mui/icons-material/Description'; // Icon for receipt
import ReceiptLink from './ReceiptLink'; // Import the new component
import Modal from '@mui/material/Modal'; // Import Modal
import Divider from '@mui/material/Divider'; // For modal content
import CloseIcon from '@mui/icons-material/Close'; // For modal close button
import Chip from '@mui/material/Chip'; // Import Chip for status display
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip

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
 * Displays a list of expenses or just the content of a single expense item.
 * Includes a modal to view itemized details if available.
 * @param {object} props - Component props.
 * @param {Array<object>} props.expenses - Array of expense objects. Each object should have `id`, `description`, `amount`, `status`, and optionally `receiptUri`, `items`, `denialReason`.
 * @param {function} [props.onDeleteExpense] - Callback function invoked when the delete button is clicked (only shown if not isSharedView). Receives the expense `id`.
 * @param {boolean} [props.isSharedView=false] - If true, hides the delete button and adjusts layout slightly.
 * @param {boolean} [props.renderItemContentOnly=false] - If true, renders only the content for the first expense item.
 */
export default function ExpenseList({ expenses, onDeleteExpense, isSharedView = false, renderItemContentOnly = false }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedExpenseItems, setSelectedExpenseItems] = useState([]);

    const handleOpenItemsModal = (items) => {
        setSelectedExpenseItems(items || []);
        setModalOpen(true);
    };

    const handleCloseItemsModal = () => {
        setModalOpen(false);
        setSelectedExpenseItems([]); // Clear items when closing
    };

    // Helper to get status chip color
    const getStatusColor = (status) => {
        switch (status) {
            case 'reimbursed': return 'success';
            case 'denied': return 'error';
            case 'pending':
            default: return 'warning';
        }
    };

    // If renderItemContentOnly is true, render only the content for the first expense
    if (renderItemContentOnly) {
        // Ensure expenses is an array and has at least one item
        if (!Array.isArray(expenses) || expenses.length === 0) {
            return null; // Or render some placeholder/error
        }
        const expense = expenses[0]; // Get the single expense

        return (
            <React.Fragment> {/* Use Fragment to avoid extra divs */}
                <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography component="span" sx={{ mr: 1 }}>
                                {expense.description || 'No Description'}
                            </Typography>
                            <Tooltip title={expense.status === 'denied' && expense.denialReason ? `Reason: ${expense.denialReason}` : ''}>
                                <Chip
                                    label={expense.status || 'pending'}
                                    color={getStatusColor(expense.status)}
                                    size="small"
                                    variant="outlined"
                                    sx={{ textTransform: 'capitalize' }}
                                />
                            </Tooltip>
                        </Box>
                    }
                    secondary={
                        <>
                            {`$${(expense.amount || 0).toFixed(2)}`}
                            {expense.receiptUri && (
                                <Typography
                                    component="span" // Use span for inline display
                                    variant="body2"
                                    sx={{ display: 'inline', ml: 1, color: 'text.secondary', fontStyle: 'italic', verticalAlign: 'middle', fontSize: '75%' }}
                                >
                                    <DescriptionIcon sx={{ fontSize: '100%', mr: 0.5 }}/>
                                    Receipt Attached
                                    <ReceiptLink receiptUri={expense.receiptUri} />
                                </Typography>
                            )}
                            {expense.status === 'denied' && expense.denialReason && !isSharedView && (
                                 <Typography variant="caption" display="block" sx={{ color: 'error.main', fontStyle: 'italic' }}>
                                    Reason: {expense.denialReason}
                                 </Typography>
                            )}
                        </>
                    }
                />
                {/* Secondary Action (Icons) */}
                <>
                    {expense.items && expense.items.length > 0 && (
                        <IconButton
                            edge="end"
                            aria-label="view items"
                            onClick={(e) => { e.stopPropagation(); handleOpenItemsModal(expense.items); }} // Prevent ListItem click
                            sx={{ mr: 1 }}
                        >
                            <InfoIcon />
                        </IconButton>
                    )}
                    {!isSharedView && onDeleteExpense && (
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={(e) => { e.stopPropagation(); onDeleteExpense(expense.id); }} // Prevent ListItem click
                        >
                            <DeleteIcon />
                        </IconButton>
                    )}
                </>
            </React.Fragment>
        );
    }

    return (
        <> {/* Use Fragment to wrap List and Modal */}
            <Box sx={{ p: 2, border: '1px dashed grey', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {isSharedView ? 'Expenses for Review' : 'Expense Log'}
                </Typography>
                {expenses.length === 0 ? (
                    <Typography>No expenses found.</Typography>
                ) : (
                    <List>
                        {/* Ensure expenses is an array before mapping */}
                        {Array.isArray(expenses) && expenses.map((expense) => (
                            <ListItem
                                key={expense.id} // Use the unique ID from the expense object
                                secondaryAction={
                                    <> {/* Wrap buttons */}
                                        {/* Conditionally render Info button if items exist */}
                                        {expense.items && expense.items.length > 0 && (
                                            <IconButton
                                                edge="end"
                                                aria-label="view items"
                                                onClick={() => handleOpenItemsModal(expense.items)}
                                                sx={{ mr: 1 }} // Add margin between buttons
                                            >
                                                <InfoIcon />
                                            </IconButton>
                                        )}
                                        {/* Only show delete button if NOT in shared view and handler exists */}
                                        {!isSharedView && onDeleteExpense && (
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={() => onDeleteExpense(expense.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </>
                                }
                                // Add divider for better separation
                                divider
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <Typography component="span" sx={{ mr: 1 }}>
                                                {expense.description || 'No Description'}
                                            </Typography>
                                            <Tooltip title={expense.status === 'denied' && expense.denialReason ? `Reason: ${expense.denialReason}` : ''}>
                                                <Chip
                                                    label={expense.status || 'pending'}
                                                    color={getStatusColor(expense.status)}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ textTransform: 'capitalize' }}
                                                />
                                            </Tooltip>
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            {`$${(expense.amount || 0).toFixed(2)}`}
                                            {/* Only show receipt link if URI exists (it will be null after reimbursement) */}
                                            {expense.receiptUri && (
                                                <Typography
                                                    component="span" // Use span for inline display
                                                    variant="body2"
                                                    sx={{ display: 'inline', ml: 1, color: 'text.secondary', fontStyle: 'italic', verticalAlign: 'middle', fontSize: '75%' }}
                                                >
                                                    <DescriptionIcon sx={{ fontSize: '100%', mr: 0.5 }}/>
                                                    Receipt Attached
                                                    {/* Render the ReceiptLink component */}
                                                    <ReceiptLink receiptUri={expense.receiptUri} />
                                                </Typography>
                                            )}
                                            {/* Show denial reason inline if present */}
                                            {expense.status === 'denied' && expense.denialReason && !isSharedView && (
                                                 <Typography variant="caption" display="block" sx={{ color: 'error.main', fontStyle: 'italic' }}>
                                                    Reason: {expense.denialReason}
                                                 </Typography>
                                            )}
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>

            {/* Modal for displaying items */}
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
