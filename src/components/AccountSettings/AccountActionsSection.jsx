import React from 'react';
import { Stack, Button, CircularProgress } from '@mui/material';

// Component for Account Actions (Password Reset, Delete)
export default function AccountActionsSection({ onResetPassword, onDeleteAccount, loadingReset, loadingDelete, disabled, email }) {
  return (
    <Stack spacing={1}>
      <Button
        variant="outlined"
        onClick={onResetPassword}
        disabled={disabled || !email} // Also disable if no email
        startIcon={loadingReset ? <CircularProgress size={20} /> : null}
      >
        {loadingReset ? 'Sending...' : 'Send Password Reset Email'}
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={onDeleteAccount}
        disabled={disabled}
        startIcon={loadingDelete ? <CircularProgress size={20} /> : null}
      >
        {loadingDelete ? 'Deleting...' : 'Delete Account'}
      </Button>
    </Stack>
  );
}
