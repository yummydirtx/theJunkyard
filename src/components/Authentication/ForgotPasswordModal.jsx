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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(event);
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

        <Box component="form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate sx={{ mt: 0.5 }}>
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
