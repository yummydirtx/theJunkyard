import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  IconButton,
  Alert,
  Stack
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

export default function AccountSettingsModal({ open, onClose, user }) {
  const [passwordResetMessage, setPasswordResetMessage] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  const handleResetPassword = () => {
    // Placeholder for reset password call
    setPasswordResetMessage('Reset password link sent to your email.');
  };

  const handleDeleteAccount = () => {
    // Placeholder for delete account call
    // console.log("Delete account clicked");
  };

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Account Settings</DialogTitle>
      <DialogContent dividers>
        {passwordResetMessage && <Alert severity="success">{passwordResetMessage}</Alert>}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Email"
            value={user?.email || ''}
            disabled
            fullWidth
          />
          <Button variant="outlined" onClick={handleResetPassword}>
            Reset Password
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
          <Stack direction="row" alignItems="center" spacing={2}>
            {profilePic ? (
              <Avatar src={profilePic} sx={{ width: 56, height: 56 }} />
            ) : (
              <Avatar sx={{ width: 56, height: 56 }} />
            )}
            <label htmlFor="profile-pic-upload">
              <input
                accept="image/*"
                id="profile-pic-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleProfilePicUpload}
              />
              <IconButton color="primary" component="span">
                <PhotoCamera />
              </IconButton>
            </label>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
