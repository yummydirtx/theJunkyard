import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

// Simple Confirmation Dialog Component
export default function ConfirmationDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button onClick={() => { onConfirm(); onClose(false); }} color="error">Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
