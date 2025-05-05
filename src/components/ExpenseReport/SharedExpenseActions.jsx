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
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

export default function SharedExpenseActions({
    updating,
    updateError,
    updateSuccess,
    onMarkReimbursed,
    onOpenDenialModal,
    selectedCount
}) {
    const disableActions = updating || selectedCount === 0;

    return (
        <>
            {/* Action Buttons */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={onMarkReimbursed}
                    disabled={disableActions}
                >
                    Mark Selected Reimbursed
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onOpenDenialModal}
                    disabled={disableActions}
                >
                    Mark Selected Denied
                </Button>
            </Box>

            {/* Update Status Messages */}
            {updating && <CircularProgress size={20} sx={{ mr: 1, mb: 1 }} />}
            {updateError && <Alert severity="error" sx={{ my: 1 }}>{updateError}</Alert>}
            {updateSuccess && <Alert severity="success" sx={{ my: 1 }}>{updateSuccess}</Alert>}
        </>
    );
}
