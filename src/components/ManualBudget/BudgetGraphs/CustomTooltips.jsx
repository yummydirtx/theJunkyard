import { Box, Typography } from '@mui/material';
import { formatCurrency } from './utils';

export const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box sx={{
                bgcolor: 'background.paper',
                p: 1,
                border: '1px solid #ccc',
                boxShadow: 2
            }}>
                <Typography variant="body2">{payload[0].name}</Typography>
                <Typography variant="body2" color="primary">
                    {payload[0].name === 'Budget' ? 'Goal: ' : 'Spent: '}
                    {formatCurrency(payload[0].value)}
                </Typography>
            </Box>
        );
    }
    return null;
};

export const PieTooltip = ({ active, payload, totalSpent }) => {
    if (active && payload && payload.length) {
        return (
            <Box sx={{
                bgcolor: 'background.paper',
                p: 1,
                border: '1px solid #ccc',
                boxShadow: 2
            }}>
                <Typography variant="body2">{payload[0].name}</Typography>
                <Typography variant="body2">
                    Amount: {formatCurrency(payload[0].value)}
                </Typography>
                <Typography variant="body2">
                    Percentage: {((payload[0].value / totalSpent) * 100).toFixed(1)}%
                </Typography>
            </Box>
        );
    }
    return null;
};
