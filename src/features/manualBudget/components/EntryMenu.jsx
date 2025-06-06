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
  Modal,
  Fade,
  Paper,
  Stack
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { DateInput, MoneyInput } from '../../../components/common/forms';
import { parseAmount } from '../../../shared/utils/financialUtils';

/**
 * Helper function to get a date string in YYYY-MM-DD format from a Date object,
 * respecting the local timezone.
 * @param {Date} [date=new Date()] - The date object to format.
 * @returns {string} The formatted date string.
 */
const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * EntryMenu provides an options menu (edit, delete) for a budget entry.
 * It includes modals for editing an entry and confirming deletion.
 * @param {object} props - The component's props.
 * @param {object} props.entry - The budget entry object.
 * @param {string} props.entry.id - The ID of the entry.
 * @param {number} props.entry.amount - The amount of the entry.
 * @param {Date|string} props.entry.date - The date of the entry.
 * @param {string} [props.entry.description] - The description of the entry.
 * @param {object} props.db - Firestore database instance.
 * @param {object} props.user - The authenticated user object.
 * @param {string} props.currentMonth - The current budget month (YYYY-MM).
 * @param {string} props.selectedCategory - The name of the category the entry belongs to.
 * @param {function} props.onEntryUpdated - Callback function invoked after an entry is updated or deleted.
 * @param {string} props.mode - The current color mode ('light' or 'dark').
 */
export default function EntryMenu({
  entry,
  db,
  user,
  currentMonth,
  selectedCategory,
  onEntryUpdated,
  mode
}) {
  /** @state {HTMLElement|null} anchorEl - Anchor element for the entry options menu. */
  const [anchorEl, setAnchorEl] = useState(null);

  /** @state {boolean} editModalOpen - Controls visibility of the edit entry modal. */
  const [editModalOpen, setEditModalOpen] = useState(false);
  /** @state {string} editAmount - Current value of the amount input in the edit modal. */
  const [editAmount, setEditAmount] = useState('');
  /** @state {string} editDate - Current value of the date input (YYYY-MM-DD) in the edit modal. */
  const [editDate, setEditDate] = useState('');
  /** @state {string} editDescription - Current value of the description input in the edit modal. */
  const [editDescription, setEditDescription] = useState('');
  /** @ref {object} dateInputRef - Reference to the date input field in the edit modal. */
  const dateInputRef = useRef(null);

  /** @state {boolean} deleteDialogOpen - Controls visibility of the delete confirmation dialog. */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  /** Opens the entry options menu. */
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /** Closes the entry options menu. */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /** Opens the edit modal and pre-populates fields with the current entry's data. */
  const handleEditClick = () => {
    handleMenuClose();
    setEditAmount(entry.amount.toString());
    // Ensure entry.date is a Date object before formatting
    const entryDateObject = entry.date instanceof Date ? entry.date : new Date(entry.date);
    setEditDate(getLocalDateString(entryDateObject));
    setEditDescription(entry.description || '');
    setEditModalOpen(true);
  };

  /** Closes the edit entry modal. */
  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  /**
   * Handles the submission of the edited entry.
   * Updates the entry in Firestore and adjusts category/month totals if the amount changed.
   * @async
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   */
  const handleEditSubmit = async (event) => {
    event.preventDefault();
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
      setEditModalOpen(false); // Close the modal on success
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  /** Opens the delete confirmation dialog. */
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  /** Closes the delete confirmation dialog. */
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  /**
   * Handles the confirmation of entry deletion.
   * Deletes the entry from Firestore and updates category/month totals.
   * @async
   */
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

      {/* Edit entry modal */}
      <Modal
        open={editModalOpen}
        onClose={handleEditModalClose}
        aria-labelledby="edit-entry-modal-title"
      >
        <Fade in={editModalOpen}>
          <Paper
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography id="edit-entry-modal-title" variant="h6" component="h2" gutterBottom sx={{ mb: 2 }}>
              Edit Entry
            </Typography>
            {/* Form Element */}
            <form onSubmit={handleEditSubmit}>
              <Stack spacing={3}>
                <MoneyInput
                  value={editAmount}
                  onChange={setEditAmount}
                  label="Amount"
                  required
                  fullWidth
                />

                <DateInput
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  ref={dateInputRef}
                  required
                  mode={mode}
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
                  slotProps={{
                      inputLabel: { shrink: true }
                  }}
                />
                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                  <Button variant="outlined" onClick={handleEditModalClose}>Cancel</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!editAmount || !editDate}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Stack>
            </form>
          </Paper>
        </Fade>
      </Modal>

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
