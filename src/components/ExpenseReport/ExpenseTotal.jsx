import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

/**
 * Displays the calculated total amount of all expenses.
 * @param {object} props - Component props.
 * @param {number} props.totalAmount - The total amount to display.
 */
// TODO: Add threshold logic/display if needed
export default function ExpenseTotal({ totalAmount }) {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h5">Total: ${totalAmount.toFixed(2)}</Typography>
            {/* Placeholder for threshold display */}
            {/* <Typography variant="body2" color="textSecondary">Threshold: $XXX.XX</Typography> */}
        </Box>
    );
}
