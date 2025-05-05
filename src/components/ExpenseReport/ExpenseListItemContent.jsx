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
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptLink from './ReceiptLink';
import { useParams } from 'react-router-dom';

// Helper to get status chip color
const getStatusColor = (status) => {
    switch (status) {
        case 'reimbursed': return 'success';
        case 'denied': return 'error';
        case 'pending':
        default: return 'warning';
    }
};

// Helper to format Firestore Timestamp or Date object
const formatDate = (timestamp) => {
    if (!timestamp) return '';
    // Firestore Timestamps have a toDate() method
    const date = timestamp.toDate ? timestamp.toDate() : timestamp;
    if (!(date instanceof Date) || isNaN(date)) return ''; // Check if it's a valid Date

    // Simple date format (e.g., MM/DD/YYYY)
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
};

/**
 * Renders the primary and secondary text content for an expense list item.
 * @param {object} props
 * @param {object} props.expense - The expense object.
 * @param {boolean} [props.showDenialReason=false] - Whether to display the denial reason inline.
 * @param {boolean} [props.isSharedView=false] - Indicates if rendered in shared context.
 */
export default function ExpenseListItemContent({ expense, showDenialReason = false, isSharedView = false }) {
    // Get shareId if this component is used within a route that has it
    // Alternatively, ensure shareId is passed down from SharedExpenseReport
    const { shareId } = useParams(); // Get shareId from URL params if applicable

    if (!expense) return null;

    // Determine which date to show based on status
    const dateToShow = expense.status === 'pending' ? expense.createdAt : expense.processedAt;
    const formattedDate = formatDate(dateToShow);
    const dateLabel = expense.status === 'pending' ? 'Created:' : 'Processed:';

    return (
        <ListItemText
            primary={
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography component="span">
                        {expense.description || 'No Description'}
                    </Typography>
                    <Tooltip title={expense.status === 'denied' && expense.denialReason ? `Reason: ${expense.denialReason}` : ''}>
                        <Chip
                            label={expense.status || 'pending'}
                            color={getStatusColor(expense.status)}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                        />
                    </Tooltip>
                </Box>
            }
            secondary={
                <>
                    {/* Amount and Date */}
                    <Typography component="span" variant="body2" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                        {`$${(expense.amount || 0).toFixed(2)}`}
                    </Typography>
                    {formattedDate && (
                        <Typography component="span" variant="caption" sx={{ ml: 1.5, color: 'text.secondary' }}>
                            {`${dateLabel} ${formattedDate}`}
                        </Typography>
                    )}

                    {/* Receipt Info */}
                    {expense.receiptUri && (
                        <Typography
                            component="span"
                            variant="body2"
                            sx={{
                                // Use responsive display property
                                display: { xs: 'block', sm: 'inline' }, // block on extra-small, inline on small and up
                                mt: { xs: 0.25, sm: 0 }, // Add some top margin on mobile
                                ml: { xs: 0, sm: 1.5 }, // Remove left margin on mobile, keep on larger screens
                                color: 'text.secondary',
                                fontStyle: 'italic',
                                verticalAlign: 'middle',
                                fontSize: '75%'
                            }}
                        >
                            <DescriptionIcon sx={{ fontSize: '100%', mr: 0.5, verticalAlign: 'text-bottom' }}/>
                            Receipt Attached
                            <ReceiptLink
                                receiptUri={expense.receiptUri}
                                isSharedView={isSharedView}
                                shareId={shareId} // Pass shareId obtained from params or props
                                expenseId={expense.id} // Pass the expense ID
                            />
                        </Typography>
                    )}
                    {/* Denial Reason */}
                    {showDenialReason && expense.status === 'denied' && expense.denialReason && (
                         <Typography variant="caption" display="block" sx={{ color: 'error.main', fontStyle: 'italic', mt: 0.5 }}>
                            Reason: {expense.denialReason}
                         </Typography>
                    )}
                </>
            }
            // Add some margin to the bottom of the text content for better spacing
            sx={{ mb: 0.5 }}
        />
    );
}
