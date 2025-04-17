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

import { useState, useRef } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import MoneyInput from './shared/MoneyInput';
import DateInput from './shared/DateInput';
import { parseAmount } from './utils/budgetUtils';

// Helper function to get YYYY-MM-DD from a Date object using local timezone
const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function EntryMenu({
  entry,
  db,
  user,
  currentMonth,
  selectedCategory,
  onEntryUpdated,
  mode
}) {
  // State for the anchor element of the options menu
  const [anchorEl, setAnchorEl] = useState(null);

  // State for the edit entry dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const dateInputRef = useRef(null); // Ref for the date input in the edit dialog

  // State for the delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // --- Menu Handlers ---
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // --- Edit Handlers ---
  // Opens the edit dialog and pre-populates fields with current entry data
  const handleEditClick = () => {
    handleMenuClose();
    setEditAmount(entry.amount.toString());
    const entryDateObject = entry.date instanceof Date ? entry.date : new Date(entry.date);
    setEditDate(getLocalDateString(entryDateObject)); // Format date for input
    setEditDescription(entry.description || '');
    setEditDialogOpen(true);
  };

  // Closes the edit dialog
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  // Handles the submission of the edited entry
  const handleEditSubmit = async () => {
    if (!editAmount || !editDate) return; // Basic validation

    const newAmount = parseAmount(editAmount);
    const amountDifference = newAmount - entry.amount; // Calculate difference for total updates

    try {
      // Parse the date string back into a Date object for Firestore
      const [year, month, day] = editDate.split('-').map(num => parseInt(num, 10));
      const dateObject = new Date(year, month - 1, day);

      // Update the entry document in Firestore
      const entryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}/entries/${entry.id}`;
      await updateDoc(doc(db, entryPath), {
        amount: newAmount,
        date: dateObject,
        description: editDescription.trim()
      });

      // If the amount changed, update the category and month totals accordingly
      if (amountDifference !== 0) {
        // Update category total
        const categoryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}`;
        const categoryDoc = await getDoc(doc(db, categoryPath));
        const categoryData = categoryDoc.data();
        const newCategoryTotal = (categoryData.total || 0) + amountDifference;
        await updateDoc(doc(db, categoryPath), { total: newCategoryTotal });

        // Update overall month total
        const monthPath = `manualBudget/${user.uid}/months/${currentMonth}`;
        const monthDoc = await getDoc(doc(db, monthPath));
        const monthData = monthDoc.data();
        const newMonthTotal = (monthData.total || 0) + amountDifference;
        await updateDoc(doc(db, monthPath), { total: newMonthTotal });
      }

      // Notify the parent component to refresh the entry list
      onEntryUpdated();
      setEditDialogOpen(false); // Close the dialog on success
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  // --- Delete Handlers ---
  // Opens the delete confirmation dialog
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  // Closes the delete confirmation dialog
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  // Handles the confirmation of entry deletion
  const handleDeleteConfirm = async () => {
    try {
      // Delete the entry document from Firestore
      const entryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}/entries/${entry.id}`;
      await deleteDoc(doc(db, entryPath));

      // Update the category total by subtracting the deleted entry's amount
      const categoryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}`;
      const categoryDoc = await getDoc(doc(db, categoryPath));
      const categoryData = categoryDoc.data();
      const newCategoryTotal = (categoryData.total || 0) - entry.amount;
      await updateDoc(doc(db, categoryPath), { total: newCategoryTotal });

      // Update the overall month total by subtracting the deleted entry's amount
      const monthPath = `manualBudget/${user.uid}/months/${currentMonth}`;
      const monthDoc = await getDoc(doc(db, monthPath));
      const monthData = monthDoc.data();
      const newMonthTotal = (monthData.total || 0) - entry.amount;
      await updateDoc(doc(db, monthPath), { total: newMonthTotal });

      // Notify the parent component to refresh the entry list
      onEntryUpdated();
      setDeleteDialogOpen(false); // Close the dialog on success
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <>
      {/* Icon button to open the options menu */}
      <IconButton
        edge="end"
        aria-label="more options"
        onClick={handleMenuOpen}
      >
        <MoreVertIcon />
      </IconButton>

      {/* Entry options menu (Edit, Delete) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

      {/* Edit entry dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleEditDialogClose} 
        fullWidth 
        maxWidth="xs" 
      >
        <DialogTitle>Edit Entry</DialogTitle>
        <DialogContent>
          {/* Form container */}
          <Box component="form" sx={{ mt: 1 }}> 
            <MoneyInput
              value={editAmount}
              onChange={setEditAmount}
              label="Amount"
              required
              margin="normal"
              fullWidth
            />
            
            <DateInput
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              ref={dateInputRef}
              required
              mode={mode}
              margin="normal"
              fullWidth
            />
            
            <TextField
              fullWidth
              label="Description (optional)"
              variant="outlined"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Coffee with friends"
              multiline
              rows={2}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={!editAmount || !editDate}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteDialogClose} 
        fullWidth 
        maxWidth="xs"
      >
        <DialogTitle>Delete Entry</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this entry? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
