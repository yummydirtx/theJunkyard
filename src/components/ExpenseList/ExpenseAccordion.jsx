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
                sx={{ minHeight: '48px', px: 0, '& .MuiAccordionSummary-content': { my: '12px', mx: 0 } }}
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
