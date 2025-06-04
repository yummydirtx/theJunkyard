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

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { Expense } from '../types/index';

interface ExpenseUpdateData {
    description: string;
    amount: number;
}

interface EditExpenseModalProps {
    /** Whether the modal is open */
    open: boolean;
    
    /** Function to close the modal */
    onClose: () => void;
    
    /** The expense to edit */
    expense: Expense | null;
    
    /** Function called when saving changes */
    onSave: (expenseId: string, data: ExpenseUpdateData) => void;
}

export default function EditExpenseModal({ open, onClose, expense, onSave }: EditExpenseModalProps) {
    const [description, setDescription] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (expense) {
            setDescription(expense.description || '');
            setAmount(expense.amount !== undefined ? expense.amount.toString() : (expense.totalAmount !== undefined ? expense.totalAmount.toString() : ''));
            setError(''); // Clear error when a new expense is loaded
        } else {
            // Reset form if expense is null (e.g., modal closed then reopened without selection)
            setDescription('');
            setAmount('');
            setError('');
        }
    }, [expense]); // Re-run effect when the expense prop changes

    const handleSave = (): void => {
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
        if (expense) {
            onSave(expense.id, {
                description: description.trim(),
                amount: parsedAmount,
            });
        }
        // onClose(); // Let the parent component handle closing on successful save
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
                        slotProps={{
                            input: {
                                inputMode: 'decimal', // Hint for mobile keyboards
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }
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
