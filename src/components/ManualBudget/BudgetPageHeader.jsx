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
import { Box, Typography, Chip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

/**
 * Formats a month string from YYYY-MM to "Month YYYY" for display.
 * @param {string} monthStr - The month string in YYYY-MM format.
 * @returns {string} The formatted month string, or the original string if formatting fails.
 */
const formatMonth = (monthStr) => {
    try {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch (e) {
        return monthStr; // Fallback in case of an error
    }
};

/**
 * BudgetPageHeader displays the main title for the Manual Budget page
 * and a chip to select/display the current budget month.
 * @param {object} props - The component's props.
 * @param {string} props.currentMonth - The current budget month (YYYY-MM).
 * @param {function} props.onMonthChipClick - Callback function invoked when the month chip is clicked.
 * @param {boolean} props.loading - Indicates if essential data (like auth state) is loading.
 * @param {object} props.activeUser - The authenticated user object.
 */
export default function BudgetPageHeader({ currentMonth, onMonthChipClick, loading, activeUser }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', mb: 2 }}>
            <Typography variant='h2'
                sx={{
                    display: { xs: 'flex', sm: 'flex' },
                    flexDirection: { xs: 'column', md: 'row' },
                    alignSelf: 'left',
                    textAlign: 'left',
                    fontSize: { xs: 'clamp(3.4rem, 10vw, 4rem)', sm: 'clamp(3.5rem, 10vw, 4rem)' },
                    fontWeight: 'bold',
                }}>
                Manual Budget
            </Typography>

            {!loading && activeUser && (
                <Chip
                    icon={<CalendarMonthIcon />}
                    label={formatMonth(currentMonth)}
                    onClick={onMonthChipClick}
                    color="primary"
                    variant="outlined"
                    sx={{
                        mt: { xs: 2, sm: 2, md: 1 },
                        fontSize: '1rem',
                        height: 'auto',
                        p: 0.5,
                        cursor: 'pointer'
                    }}
                />
            )}
        </Box>
    );
}