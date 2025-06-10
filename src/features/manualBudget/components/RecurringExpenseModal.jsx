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

import { useState, useEffect } from 'react';
import {
    Modal,
    Fade,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { MoneyInput } from '../../../components/common/forms'; // Shared form component
import { parseAmount } from '../../../shared/utils/financialUtils'; // Shared utility

/**
 * RecurringExpenseModal allows users to add, view, edit, and delete recurring monthly expenses.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.open - Controls the visibility of the modal.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {object} props.db - Firestore database instance.
 * @param {object} props.user - The authenticated user object.
 * @param {Array<string>} props.categories - List of available category names for selection.
 * @param {function} props.addRecurringExpenseDefinition - Function to save/update a recurring expense.
 * @param {Array<object>} props.recurringExpensesList - List of existing recurring expenses.
 * @param {function} props.fetchRecurringExpenseDefinitions - Function to refresh the list.
 * @param {function} props.deleteRecurringExpenseDefinition - Function to delete a recurring expense.
 */
export default function RecurringExpenseModal({
    open,
    onClose,
    db,
    user,
    categories = [], // Provide default empty array
    addRecurringExpenseDefinition,
    recurringExpensesList = [],
    fetchRecurringExpenseDefinitions,
    deleteRecurringExpenseDefinition
}) {
    // State for the form to add/edit a recurring expense
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [recurrenceType, setRecurrenceType] = useState('specificDay'); // 'specificDay' or 'lastDay'
    const [dayOfMonth, setDayOfMonth] = useState('1');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false); // For form submission
    const [listLoading, setListLoading] = useState(false); // For loading the list

    // Fetch recurring expenses when the modal opens or user changes
    useEffect(() => {
        if (open && user && fetchRecurringExpenseDefinitions) {
            setListLoading(true);
            fetchRecurringExpenseDefinitions().finally(() => setListLoading(false));
        }
    }, [open, user, fetchRecurringExpenseDefinitions]);


    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setDescription('');
        setAmount('');
        setSelectedCategory('');
        setRecurrenceType('specificDay');
        setDayOfMonth('1');
        setError('');
        setSuccessMessage('');
    };

    const handleCloseModal = () => {
        resetForm();
        onClose();
    };

    const validateForm = () => {
        if (!description.trim()) return "Description is required.";
        if (!amount) return "Amount is required.";
        const parsedAmt = parseAmount(amount);
        if (isNaN(parsedAmt) || parsedAmt <= 0) return "Please enter a valid positive amount.";
        if (!selectedCategory) return "Category is required.";
        if (recurrenceType === 'specificDay') {
            const day = parseInt(dayOfMonth, 10);
            if (isNaN(day) || day < 1 || day > 31) return "Day of month must be between 1 and 31.";
        }
        return ""; // No error
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        const formError = validateForm();
        if (formError) {
            setError(formError);
            return;
        }

        setLoading(true);
        const recurringExpenseData = {
            description: description.trim(),
            amount: parseAmount(amount),
            categoryId: selectedCategory,
            recurrenceType: recurrenceType,
            dayOfMonth: recurrenceType === 'specificDay' ? parseInt(dayOfMonth, 10) : null,
            userId: user.uid, // Ensure userId is stored
        };

        try {
            await addRecurringExpenseDefinition(recurringExpenseData, editingId); // Pass editingId for updates
            setSuccessMessage(editingId ? 'Recurring expense updated successfully!' : 'Recurring expense added successfully!');
            resetForm(); // Reset form after successful submission
            if (fetchRecurringExpenseDefinitions) { // Refresh the list
                setListLoading(true);
                fetchRecurringExpenseDefinitions().finally(() => setListLoading(false));
            }
        } catch (err) {
            console.error("Error saving recurring expense:", err);
            setError(`Failed to save recurring expense: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (expense) => {
        setIsEditing(true);
        setEditingId(expense.id);
        setDescription(expense.description);
        setAmount(expense.amount.toString());
        setSelectedCategory(expense.categoryId);
        setRecurrenceType(expense.recurrenceType);
        setDayOfMonth(expense.recurrenceType === 'specificDay' && expense.dayOfMonth ? expense.dayOfMonth.toString() : '1');
        setError('');
        setSuccessMessage('');
    };

    const handleDelete = async (expenseId) => {
        setListLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await deleteRecurringExpenseDefinition(expenseId);
            setSuccessMessage('Recurring expense deleted successfully!');
            if (editingId === expenseId) { // If deleting the item currently being edited
                resetForm();
            }
            if (fetchRecurringExpenseDefinitions) {
                fetchRecurringExpenseDefinitions().finally(() => setListLoading(false));
            }
        } catch (err) {
            console.error("Error deleting recurring expense:", err);
            setError(`Failed to delete recurring expense: ${err.message}`);
            setListLoading(false);
        }
    };


    return (
        <Modal
            open={open}
            onClose={handleCloseModal}
            aria-labelledby="recurring-expense-modal-title"
            closeAfterTransition
        >
            <Fade in={open}>
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '95%', sm: 500, md: 600 }, // Adjusted width
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: { xs: 2, sm: 3, md: 4 },
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Typography id="recurring-expense-modal-title" variant="h6" component="h2" gutterBottom>
                        {isEditing ? 'Edit Recurring Expense' : 'Add New Recurring Expense'}
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {successMessage && !error && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Stack spacing={2} sx={{flexGrow: 1}}>
                            <TextField
                                fullWidth
                                label="Description"
                                variant="outlined"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                disabled={loading}
                            />

                            <MoneyInput
                                value={amount}
                                onChange={setAmount}
                                label="Amount"
                                required
                                fullWidth
                                disabled={loading}
                            />

                            <FormControl fullWidth required disabled={loading}>
                                <InputLabel id="recurring-category-select-label">Category</InputLabel>
                                <Select
                                    labelId="recurring-category-select-label"
                                    value={selectedCategory}
                                    label="Category"
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl component="fieldset" disabled={loading}>
                                <Typography variant="body2" component="legend" sx={{ mb: 0.5, color: 'text.secondary' }}>Recurrence Type</Typography>
                                <RadioGroup
                                    row
                                    aria-label="recurrence-type"
                                    name="recurrenceType"
                                    value={recurrenceType}
                                    onChange={(e) => setRecurrenceType(e.target.value)}
                                >
                                    <FormControlLabel value="specificDay" control={<Radio />} label="Specific Day of Month" />
                                    <FormControlLabel value="lastDay" control={<Radio />} label="Last Day of Month" />
                                </RadioGroup>
                            </FormControl>

                            {recurrenceType === 'specificDay' && (
                                <TextField
                                    fullWidth
                                    label="Day of Month (1-31)"
                                    variant="outlined"
                                    type="number"
                                    value={dayOfMonth}
                                    onChange={(e) => setDayOfMonth(e.target.value)}
                                    inputProps={{ min: 1, max: 31, step: 1 }}
                                    required
                                    disabled={loading}
                                />
                            )}
                        </Stack>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, pt:2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Button variant="outlined" onClick={handleCloseModal} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" color="primary" disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : (isEditing ? 'Save Changes' : 'Add Expense')}
                            </Button>
                             {isEditing && (
                                <Button variant="text" onClick={resetForm} disabled={loading}>
                                    Add New Instead
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom sx={{mt: 1}}>Existing Recurring Expenses</Typography>
                    {listLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : recurringExpensesList.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No recurring expenses defined yet.</Typography>
                    ) : (
                        <List dense sx={{ maxHeight: 200, overflow: 'auto', flexShrink: 0 }}>
                            {recurringExpensesList.map((exp) => (
                                <ListItem
                                    key={exp.id}
                                    secondaryAction={
                                        <>
                                            <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(exp)} size="small">
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(exp.id)} color="error" size="small">
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </>
                                    }
                                    divider
                                >
                                    <ListItemText
                                        primary={exp.description}
                                        secondary={`$${exp.amount.toFixed(2)} - ${exp.categoryId} - ${exp.recurrenceType === 'lastDay' ? 'Last day' : `Day ${exp.dayOfMonth}`}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
            </Fade>
        </Modal>
    );
}