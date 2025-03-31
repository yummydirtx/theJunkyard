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
  Typography,
  InputAdornment
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export default function EntryMenu({
  entry,
  db,
  user,
  currentMonth,
  selectedCategory,
  onEntryUpdated,
  mode
}) {
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const dateInputRef = useRef(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Menu handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Edit handlers
  const handleEditClick = () => {
    handleMenuClose();
    setEditAmount(entry.amount.toString());
    setEditDate(new Date(entry.date).toISOString().split('T')[0]);
    setEditDescription(entry.description || '');
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleAmountChange = (event) => {
    // Only allow numbers and decimal points
    const value = event.target.value.replace(/[^0-9.]/g, '');
    setEditAmount(value);
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      // Try to open the native date picker using multiple methods for cross-browser compatibility
      dateInputRef.current.focus();

      // For modern browsers that support showPicker
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        // Fallback - simulate click on the input to open the date picker
        dateInputRef.current.click();
      }
    }
  };

  const handleEditSubmit = async () => {
    if (!editAmount || !editDate) return;

    const newAmount = Math.round(parseFloat(editAmount) * 100) / 100;
    const amountDifference = newAmount - entry.amount;

    try {
      // Parse the date correctly to avoid timezone issues
      const [year, month, day] = editDate.split('-').map(num => parseInt(num, 10));
      const dateObject = new Date(year, month - 1, day); // month is 0-indexed in JavaScript Date

      // Update the entry
      const entryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}/entries/${entry.id}`;
      await updateDoc(doc(db, entryPath), {
        amount: newAmount,
        date: dateObject,
        description: editDescription.trim()
      });

      // If amount changed, update category and month totals
      if (amountDifference !== 0) {
        // Update category total
        const categoryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}`;
        const categoryDoc = await getDoc(doc(db, categoryPath));
        const categoryData = categoryDoc.data();
        const newCategoryTotal = (categoryData.total || 0) + amountDifference;
        await updateDoc(doc(db, categoryPath), { total: newCategoryTotal });

        // Update month total
        const monthPath = `manualBudget/${user.uid}/months/${currentMonth}`;
        const monthDoc = await getDoc(doc(db, monthPath));
        const monthData = monthDoc.data();
        const newMonthTotal = (monthData.total || 0) + amountDifference;
        await updateDoc(doc(db, monthPath), { total: newMonthTotal });
      }

      // Notify parent component to refresh
      onEntryUpdated();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  // Delete handlers
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Delete the entry
      const entryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}/entries/${entry.id}`;
      await deleteDoc(doc(db, entryPath));

      // Update category total
      const categoryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${selectedCategory}`;
      const categoryDoc = await getDoc(doc(db, categoryPath));
      const categoryData = categoryDoc.data();
      const newCategoryTotal = (categoryData.total || 0) - entry.amount;
      await updateDoc(doc(db, categoryPath), { total: newCategoryTotal });

      // Update month total
      const monthPath = `manualBudget/${user.uid}/months/${currentMonth}`;
      const monthDoc = await getDoc(doc(db, monthPath));
      const monthData = monthDoc.data();
      const newMonthTotal = (monthData.total || 0) - entry.amount;
      await updateDoc(doc(db, monthPath), { total: newMonthTotal });

      // Notify parent component to refresh
      onEntryUpdated();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <>
      <IconButton
        edge="end"
        aria-label="more options"
        onClick={handleMenuOpen}
      >
        <MoreVertIcon />
      </IconButton>

      {/* Entry options menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

      {/* Edit entry dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Entry</DialogTitle>
        <DialogContent>
          <Box component="form">
            <TextField
              fullWidth
              label="Amount"
              variant="outlined"
              value={editAmount}
              onChange={handleAmountChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              placeholder="0.00"
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              variant="outlined"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              required
              inputRef={dateInputRef}
              sx={{
                '& input[type="date"]::-webkit-calendar-picker-indicator': {
                  display: 'none' // Hide default calendar icon
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarTodayIcon
                      sx={{
                        color: mode === 'light' ? 'black' : 'white',
                        cursor: 'pointer'
                      }}
                      onClick={handleCalendarClick}
                    />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
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
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
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
