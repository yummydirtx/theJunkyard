import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Alert
} from '@mui/material';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import CloseIcon from '@mui/icons-material/Close';

export default function ForgotPasswordModal({ open, onClose, app, initialEmail = '' }) {
  const auth = getAuth(app);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Use initialEmail when modal opens
  useEffect(() => {
    if (open && initialEmail) {
      setEmail(initialEmail);
    }
  }, [open, initialEmail]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccessMessage('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="xs" 
      fullWidth
      slotProps={{
        paper: {
          style: {
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
          }
        },
        backdrop: {
          style: {
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5"><strong>Reset Password</strong></Typography>
          <IconButton edge="end" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{successMessage}</Alert>}

        <Typography variant="body1" sx={{ mb: 1 }}>
          Enter your email address and we'll send you instructions to reset your password.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 0.5 }}>
          <TextField
            margin="dense"
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleChange}
            error={!!error && !email.trim()}
            helperText={(!email.trim() && error === 'Please enter your email address') ? "Email is required" : ""}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Send Reset Link
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
