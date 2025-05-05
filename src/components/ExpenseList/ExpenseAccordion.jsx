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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import List from '@mui/material/List';

/**
 * Renders a collapsible accordion section for a list of expenses.
 * @param {object} props
 * @param {string} props.title - The title for the accordion summary (e.g., "Denied Expenses").
 * @param {number} props.count - The number of expenses in this section.
 * @param {Array<object>} props.expenses - The array of expense objects to list.
 * @param {function} props.renderItem - Function that takes an expense object and returns the JSX for the list item.
 * @param {boolean} props.addTopMargin - Whether to add top margin (mt: 2).
 */
export default function ExpenseAccordion({ title, count, expenses, renderItem, addTopMargin }) {
    if (!expenses || expenses.length === 0) {
        return null;
    }

    return (
        <Accordion
            disableGutters
            sx={{
                mt: addTopMargin ? 2 : 0,
                '&:before': { display: 'none' },
                boxShadow: 'none',
                borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                bgcolor: 'transparent',
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${title.toLowerCase().replace(' ', '-')}-content`}
                id={`${title.toLowerCase().replace(' ', '-')}-header`}
                sx={{ minHeight: '48px', '& .MuiAccordionSummary-content': { my: '12px' } }}
            >
                <Typography sx={{ color: 'text.secondary' }}>
                    {title} ({count})
                </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ p: 0 }}>
                    {expenses.map(renderItem)}
                </List>
            </AccordionDetails>
        </Accordion>
    );
}
