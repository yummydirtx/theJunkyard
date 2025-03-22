import React from 'react';
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
