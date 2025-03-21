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

import * as React from 'react';
import { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
    Box,
    Button,
    CssBaseline,
    TextField,
    Typography,
    Container,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Fade
} from '@mui/material';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import { alpha } from '@mui/material/styles';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import AppAppBar from '../components/AppAppBar';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import Divider from '@mui/material/Divider';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import SignUpModal from '../components/SignUpModal';

function useTitle(title) {
    React.useEffect(() => {
        const prevTitle = document.title
        document.title = title
        return () => {
            document.title = prevTitle
        }
    })
}

export default function ManualBudget({ setMode, mode, app }) {
    useTitle('theJunkyard: Manual Budget');
    const defaultTheme = createTheme({ palette: { mode } });
    const auth = getAuth(app);
    const db = getFirestore(app);
    const [user, setUser] = useState(auth.currentUser);
    const [selectedOption, setSelectedOption] = useState('');
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [signUpModalOpen, setSignUpModalOpen] = useState(false);

    useEffect(() => {
        const authChange = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // User is signed in, get their name from Firestore
                try {
                    var userDoc = await getDoc(doc(db, 'manualBudget', currentUser.uid));
                    if (userDoc.exists()) {
                        setName(userDoc.data().name);
                    }

                    // Fetch categories from the specified path
                    const categoriesPath = `manualBudget/${currentUser.uid}/months/2025-03/categories`;
                    const categoriesSnapshot = await getDocs(collection(db, categoriesPath));
                    const categoriesList = categoriesSnapshot.docs.map(doc => doc.id);
                    setCategories(categoriesList);
                } catch (error) {
                    console.error('Error getting user data:', error);
                }
            }
            setLoading(false);
        });
        return authChange;
    }, [auth, db]);

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const openLoginModal = () => {
        setLoginModalOpen(true);
    };

    const closeLoginModal = () => {
        setLoginModalOpen(false);
    };

    const openSignUpModal = () => {
        setSignUpModalOpen(true);
    };

    const closeSignUpModal = () => {
        setSignUpModalOpen(false);
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <AppAppBar mode={mode} toggleColorMode={setMode} app={app} />
            <Box
                sx={(theme) => ({
                    width: '100%',
                    backgroundImage:
                        theme.palette.mode === 'light'
                            ? 'linear-gradient(180deg, #CEE5FD, #FFF)'
                            : `linear-gradient(#02294F, ${alpha('#090E10', 0.0)})`,
                    backgroundSize: '100% 10%',
                    backgroundRepeat: 'no-repeat',
                })}
            >
                <Container maxWidth="lg" sx={{ pt: { xs: 12, sm: 15 }, minHeight: '90vh' }}>
                    <Typography variant='h2'
                        sx={{
                            display: { xs: 'flex', sm: 'flex' },
                            flexDirection: { xs: 'column', md: 'row' },
                            alignSelf: 'left',
                            textAlign: 'left',
                            fontSize: { xs: 'clamp(3.4rem, 10vw, 4rem)', sm: 'clamp(3.5rem, 10vw, 4rem)' },
                            fontWeight: 'bold',
                            pb: '0.25rem',
                        }}>
                        Manual Budget
                    </Typography>

                    {!loading && (user ? (
                        <>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel id="budget-select-label">Budget Options</InputLabel>
                                <Select
                                    labelId="budget-select-label"
                                    id="budget-select"
                                    value={selectedOption}
                                    label="Budget Options"
                                    onChange={handleChange}
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category} value={category}>{category}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Typography>Hello {name}, welcome to Manual Budget</Typography>
                        </>
                    ) : (
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
                    ))}
                </Container>
                <Divider sx={{ pt: { sm: 8 }, display: { xs: 'none', sm: 'inherit' } }} />
                <Footer />
            </Box>
            <LoginModal
                open={loginModalOpen}
                onClose={closeLoginModal}
                app={app}
            />
            <SignUpModal
                open={signUpModalOpen}
                onClose={closeSignUpModal}
                app={app}
            />
        </ThemeProvider>
    );
}
