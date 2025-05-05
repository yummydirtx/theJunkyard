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
