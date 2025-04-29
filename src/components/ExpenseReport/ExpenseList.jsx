import React from 'react'; // Removed useState, useEffect
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import DescriptionIcon from '@mui/icons-material/Description'; // Icon for receipt
import ReceiptLink from './ReceiptLink'; // Import the new component

/**
 * Displays a list of expenses with descriptions, amounts, and delete functionality.
 * @param {object} props - Component props.
 * @param {Array<object>} props.expenses - Array of expense objects. Each object should have at least `id`, `description`, and `amount`. It might also have `receiptUri`.
 * @param {function} props.onDeleteExpense - Callback function invoked when the delete button for an expense is clicked. Receives the expense `id`.
 */
export default function ExpenseList({ expenses, onDeleteExpense }) {
    return (
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
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    // Call the onDeleteExpense prop with the expense's ID
                                    onClick={() => onDeleteExpense(expense.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            }
                            // Add divider for better separation
                            divider
                        >
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
                                                sx={{ display: 'inline', ml: 1, color: 'text.secondary', fontStyle: 'italic', verticalAlign: 'middle' }}
                                            >
                                                <DescriptionIcon sx={{ fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }}/>
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
    );
}
