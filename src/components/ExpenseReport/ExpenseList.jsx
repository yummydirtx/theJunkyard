import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';

// TODO: Implement actual display logic, receipt links, and delete functionality
export default function ExpenseList({ expenses, onDeleteExpense }) {
    return (
        <Box sx={{ p: 2, border: '1px dashed grey', mb: 3 }}>
            <Typography variant="h6" gutterBottom>Expense Log</Typography>
            {expenses.length === 0 ? (
                <Typography>No expenses logged yet.</Typography>
            ) : (
                <List>
                    {expenses.map((expense, index) => (
                        <ListItem
                            key={index} // Use a proper ID in real implementation
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => console.log('Delete:', index) /* onDeleteExpense(expense.id) */}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText
                                primary={expense.description || 'No Description'}
                                secondary={`$${(expense.amount || 0).toFixed(2)} - Receipt: ${expense.receiptFile ? expense.receiptFile.name : 'None'}`} // Placeholder receipt info
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
}
