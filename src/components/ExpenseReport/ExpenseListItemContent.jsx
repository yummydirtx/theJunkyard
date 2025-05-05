import React from 'react';
import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptLink from './ReceiptLink';

// Helper to get status chip color
const getStatusColor = (status) => {
    switch (status) {
        case 'reimbursed': return 'success';
        case 'denied': return 'error';
        case 'pending':
        default: return 'warning';
    }
};

/**
 * Renders the primary and secondary text content for an expense list item.
 * @param {object} props
 * @param {object} props.expense - The expense object.
 * @param {boolean} [props.showDenialReason=false] - Whether to display the denial reason inline.
 */
export default function ExpenseListItemContent({ expense, showDenialReason = false }) {
    if (!expense) return null;

    return (
        <ListItemText
            primary={
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography component="span" sx={{ mr: 1 }}>
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
                    {`$${(expense.amount || 0).toFixed(2)}`}
                    {expense.receiptUri && (
                        <Typography
                            component="span"
                            variant="body2"
                            sx={{ display: 'inline', ml: 1, color: 'text.secondary', fontStyle: 'italic', verticalAlign: 'middle', fontSize: '75%' }}
                        >
                            <DescriptionIcon sx={{ fontSize: '100%', mr: 0.5 }}/>
                            Receipt Attached
                            <ReceiptLink receiptUri={expense.receiptUri} />
                        </Typography>
                    )}
                    {/* Show denial reason inline if requested and present */}
                    {showDenialReason && expense.status === 'denied' && expense.denialReason && (
                         <Typography variant="caption" display="block" sx={{ color: 'error.main', fontStyle: 'italic' }}>
                            Reason: {expense.denialReason}
                         </Typography>
                    )}
                </>
            }
        />
    );
}
