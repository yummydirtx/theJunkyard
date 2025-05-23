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

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Alert,
  Link
} from '@mui/material';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import GoogleIcon from '@mui/icons-material/Google';
import CloseIcon from '@mui/icons-material/Close';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function LoginModal({ open, onClose, app }) {
  const auth = getAuth(app);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      onClose();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => {
        onClose();
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const openForgotPassword = (event) => {
    // Prevent default to avoid form validation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setForgotPasswordOpen(true);
  };

  const closeForgotPassword = () => {
    setForgotPasswordOpen(false);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
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
            <Typography variant="h5"><strong>Log In</strong></Typography>
            <IconButton edge="end" onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} sx={{ mt: 1 }}>
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mt: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
              <Link 
                component="button"
                variant="body2"
                onClick={openForgotPassword}
                type="button" // This ensures it doesn't submit the form
                sx={{ cursor: 'pointer' }}
                tabIndex={-1} // Prevents focusing when tabbing through form
              >
                Forgot password?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Log in
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
            >
              Sign in with Google
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      
      <ForgotPasswordModal 
        open={forgotPasswordOpen}
        onClose={closeForgotPassword}
        app={app}
        initialEmail={formData.email} // Pass current email value
      />
    </>
  );
}