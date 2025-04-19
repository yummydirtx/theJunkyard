import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ReceiptUpload from './ReceiptUpload'; // Placeholder import
import CircularProgress from '@mui/material/CircularProgress'; // For loading state
import Collapse from '@mui/material/Collapse'; // Import Collapse
import IconButton from '@mui/material/IconButton'; // Optional: for icon button toggle
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Optional: example icon
import ExpandLessIcon from '@mui/icons-material/ExpandLess'; // Optional: example icon

// TODO: Implement actual form submission logic, state management, and integration with ReceiptUpload
export default function ExpenseForm({ onAddExpense }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [receiptFile, setReceiptFile] = useState(null); // Placeholder state for file
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
    const [error, setError] = useState(''); // Error state
    const [isExpanded, setIsExpanded] = useState(true); // State for collapse

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
            // Optionally collapse after successful add:
            // setIsExpanded(false);
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

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Box sx={{ p: 2, border: '1px dashed grey', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={toggleExpand}>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>Add New Expense</Typography>
                {/* IconButton Toggle */}
                <IconButton onClick={toggleExpand} size="small">
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <TextField
                    label="Description"
                    variant="outlined"
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mt: 2, mb: 2 }} // Added mt: 2
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
            </Collapse>
        </Box>
    );
}
