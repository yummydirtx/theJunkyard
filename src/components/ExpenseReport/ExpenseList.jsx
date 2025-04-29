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
 * Displays a list of expenses with descriptions, amounts, and delete functionality.
 * Includes a modal to view itemized details if available.
 * @param {object} props - Component props.
 * @param {Array<object>} props.expenses - Array of expense objects. Each object should have `id`, `description`, `amount`, and optionally `receiptUri` and `items`.
 * @param {function} props.onDeleteExpense - Callback function invoked when the delete button for an expense is clicked. Receives the expense `id`.
 */
export default function ExpenseList({ expenses, onDeleteExpense }) {
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

    return (
        <> {/* Use Fragment to wrap List and Modal */}
            <Box sx={{ p: 2, border: '1px dashed grey', mb: 3 }}>
                <Typography variant="h6" gutterBottom>Expense Log</Typography>
                {expenses.length === 0 ? (
                    <Typography>No expenses logged yet.</Typography>
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
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            // Call the onDeleteExpense prop with the expense's ID
                                            onClick={() => onDeleteExpense(expense.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                }
                                // Add divider for better separation
                                divider
                            >
                                {/* ... (ListItemText with ReceiptLink remains the same) ... */}
                                <ListItemText
                                    primary={expense.description || 'No Description'}
                                    // Display amount and indicate if a receipt is attached
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
                                                    {/* Render the ReceiptLink component */}
                                                    <ReceiptLink receiptUri={expense.receiptUri} />
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
