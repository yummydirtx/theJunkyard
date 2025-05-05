import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';

export default function EditExpenseModal({ open, onClose, expense, onSave }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (expense) {
            setDescription(expense.description || '');
            setAmount(expense.amount !== undefined ? expense.amount.toString() : '');
            setError(''); // Clear error when a new expense is loaded
        } else {
            // Reset form if expense is null (e.g., modal closed then reopened without selection)
            setDescription('');
            setAmount('');
            setError('');
        }
    }, [expense]); // Re-run effect when the expense prop changes

    const handleSave = () => {
        setError(''); // Clear previous errors
        const parsedAmount = parseFloat(amount);

        if (!description.trim()) {
            setError('Description cannot be empty.');
            return;
        }
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }

        // Call the onSave prop with the updated data
        onSave(expense.id, {
            description: description.trim(),
            amount: parsedAmount,
        });
        // onClose(); // Let the parent component handle closing on successful save
    };

    const handleAmountChange = (e) => {
        // Allow only numbers and a single decimal point
        const value = e.target.value;
        if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
            setAmount(value);
        }
    };

    // Don't render if no expense is provided
    if (!expense) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        required
                        margin="dense"
                        id="edit-description"
                        label="Description"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        required
                        margin="dense"
                        id="edit-amount"
                        label="Amount"
                        type="text" // Use text to allow custom validation pattern
                        fullWidth
                        variant="outlined"
                        value={amount}
                        onChange={handleAmountChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            inputMode: 'decimal', // Hint for mobile keyboards
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save Changes</Button>
            </DialogActions>
        </Dialog>
    );
}
