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

/**
 * CustomTooltip component for Recharts, typically used with BarChart or LineChart.
 * Displays the name and value of the hovered data point.
 * @param {object} props - The component's props, passed by Recharts.
 * @param {boolean} props.active - True if the tooltip is active (mouse is over a data point).
 * @param {Array<object>} props.payload - Array containing the data of the hovered element.
 * @param {string|number} props.label - The label of the hovered data point (e.g., XAxis value).
 * @returns {JSX.Element|null} A Box component with tooltip content, or null if not active.
 */
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

/**
 * PieTooltip component for Recharts, specifically designed for PieChart.
 * Displays the name, amount, and percentage of the total for the hovered pie slice.
 * @param {object} props - The component's props, passed by Recharts.
 * @param {boolean} props.active - True if the tooltip is active (mouse is over a pie slice).
 * @param {Array<object>} props.payload - Array containing the data of the hovered pie slice.
 * @param {string} props.payload[0].name - Name of the category for the slice.
 * @param {number} props.payload[0].value - Value (amount) of the slice.
 * @param {number} props.totalSpent - The total amount spent across all categories, used to calculate percentage.
 * @returns {JSX.Element|null} A Box component with tooltip content, or null if not active.
 */
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
