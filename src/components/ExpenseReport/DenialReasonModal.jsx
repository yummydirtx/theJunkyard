import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function DenialReasonModal({
    open,
    onClose,
    reason,
    onReasonChange,
    onConfirm
}) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Denial Reason (Optional)</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please provide a brief reason for denying the selected expense(s).
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="denial-reason"
                    label="Reason"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onConfirm} color="error">Confirm Denial</Button>
            </DialogActions>
        </Dialog>
    );
}
