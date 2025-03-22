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

import {
    Box,
    Button,
    Typography,
    Fade
} from '@mui/material';
import Stack from '@mui/material/Stack';

export default function LoginPrompt ({ openLoginModal, openSignUpModal, loading, user }) {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
        }}>
            <Fade in={!loading && !user} timeout={1000}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ mb: 2 }}>Please log in to use Manual Budget</Typography>
                    <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={openSignUpModal}
                        >
                            Sign Up
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={openLoginModal}
                        >
                            Log In
                        </Button>
                    </Stack>
                </Box>
            </Fade>
        </Box>
    );
};
