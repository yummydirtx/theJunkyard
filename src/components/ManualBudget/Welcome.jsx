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

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Fade
} from '@mui/material';
import Stack from '@mui/material/Stack';

/**
 * Welcome component displays a greeting message to the user in the Manual Budget page.
 * It initially shows a personalized welcome, then transitions to a prompt to select or create a category.
 * @param {object} props - The component's props.
 * @param {string} props.name - The name of the user to be displayed in the welcome message.
 */
export default function Welcome({ name }) {
    /** @state {boolean} visible - Controls the visibility of the initial "Hello {name}" message. */
    const [visible, setVisible] = useState(true);
    /** @state {boolean} showCategoryText - Controls the visibility of the "Please select or create a category" message. */
    const [showCategoryText, setShowCategoryText] = useState(false);

    useEffect(() => {
        // Hide the initial welcome message after a delay.
        const welcomeTimer = setTimeout(() => {
            setVisible(false);
            
            // After the welcome message fades, show the category prompt message after another delay.
            const categoryTimer = setTimeout(() => {
                setShowCategoryText(true);
            }, 1000); // Delay for the category prompt to appear after welcome message starts fading.
            
            return () => clearTimeout(categoryTimer);
        }, 2000); // Duration the welcome message is visible.

        return () => clearTimeout(welcomeTimer);
    }, []);

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
        }}>
            <Box sx={{ width: '100%', position: 'relative', textAlign: 'center' }}>
                <Fade in={visible && Boolean(name)} timeout={1000}>
                    <Box sx={{ position: 'absolute', width: '100%' }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>Hello {name}, welcome to Manual Budget.</Typography>
                    </Box>
                </Fade>
                <Fade in={showCategoryText} timeout={1000}>
                    <Box sx={{ position: 'absolute', width: '100%' }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Please select or create a category to begin.
                        </Typography>
                    </Box>
                </Fade>
            </Box>
        </Box>
    );
};
