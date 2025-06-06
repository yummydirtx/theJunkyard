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

import { Box } from '@mui/material';

/**
 * TabPanel is a helper component used with MUI Tabs to display the content
 * of a specific tab. It conditionally renders its children based on whether
 * its `index` matches the currently active `value` (selected tab).
 * It also sets appropriate ARIA attributes for accessibility.
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The content to be displayed within the tab panel.
 * @param {number} props.value - The index of the currently selected tab.
 * @param {number} props.index - The index of this specific tab panel.
 * @param {object} [props.other] - Any other props to be spread onto the root div element.
 * @returns {JSX.Element} The TabPanel component.
 */
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`budget-graph-tabpanel-${index}`}
            aria-labelledby={`budget-graph-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 2 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default TabPanel;
