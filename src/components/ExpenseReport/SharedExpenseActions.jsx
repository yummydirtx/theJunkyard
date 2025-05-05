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
