import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ReceiptUpload from './ReceiptUpload'; // Placeholder import
import CircularProgress from '@mui/material/CircularProgress'; // For loading state

// TODO: Implement actual form submission logic, state management, and integration with ReceiptUpload
export default function ExpenseForm({ onAddExpense }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [receiptFile, setReceiptFile] = useState(null); // Placeholder state for file
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
    const [error, setError] = useState(''); // Error state

    const handleAdd = async () => {
        setError(''); // Clear previous errors
        // Basic validation
        if (!description.trim() || !amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid description and positive amount.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Call parent function to add expense
            await onAddExpense({
                description: description.trim(),
                amount: parseFloat(amount),
                receiptFile // Pass the file object (parent will handle upload/naming)
            });
            // Reset form on successful submission (handled by parent potentially, but good practice here too)
            setDescription('');
            setAmount('');
            setReceiptFile(null);
            // TODO: Clear ReceiptUpload state if needed externally
        } catch (err) {
            console.error("Submission error in form:", err);
            setError('Failed to add expense. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = (file) => {
        setReceiptFile(file);
        console.log("File selected:", file);
    };

    return (
        <Box sx={{ p: 2, border: '1px dashed grey', mb: 3 }}>
            <Typography variant="h6" gutterBottom>Add New Expense</Typography>
            <TextField
                label="Description"
                variant="outlined"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ mb: 2 }}
                disabled={isSubmitting}
                required
            />
            <TextField
                label="Amount ($)"
                variant="outlined"
                type="number"
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                sx={{ mb: 2 }}
                disabled={isSubmitting}
                required
                inputProps={{ step: "0.01", min: "0.01" }} // Basic input validation
            />
            {/* Placeholder for Receipt Upload Component */}
            <ReceiptUpload onFileSelect={handleFileSelect} disabled={isSubmitting} />
            {error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}
            <Button
                variant="contained"
                onClick={handleAdd}
                sx={{ mt: 2 }}
                disabled={isSubmitting}
            >
                {isSubmitting ? <CircularProgress size={24} /> : 'Add Expense'}
            </Button>
        </Box>
    );
}
