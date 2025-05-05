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
