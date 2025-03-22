import * as React from 'react';
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

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
