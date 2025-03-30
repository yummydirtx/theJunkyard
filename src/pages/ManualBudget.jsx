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

import { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
    Box,
    Button,
    CssBaseline,
    Typography,
    Container,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useState } from 'react';
import { alpha } from '@mui/material/styles';
import { getFirestore, doc, getDoc, getDocs, collection, deleteDoc, setDoc } from 'firebase/firestore';
import AppAppBar from '../components/AppAppBar';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Divider from '@mui/material/Divider';
import Footer from '../components/Footer';
import LoginModal from '../components/Authentication/LoginModal';
import SignUpModal from '../components/Authentication/SignUpModal';
import LoginPrompt from '../components/ManualBudget/LoginPrompt';
import { useTitle } from '../components/useTitle';
import Welcome from '../components/ManualBudget/Welcome';
import AddCategoryModal from '../components/ManualBudget/AddCategoryModal';
import RemoveCategoryDialog from '../components/ManualBudget/RemoveCategoryDialog';
import useModal from '../hooks/useModal';

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
    const [currentMonth, setCurrentMonth] = useState('');
    
    // Use the custom hook for modal state management
    const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
    const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);
    const [addCategoryModalOpen, openAddCategoryModal, closeAddCategoryModal] = useModal(false);
    const [confirmDialogOpen, openConfirmDialog, closeConfirmDialog] = useModal(false);

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

                    // Calculate current month in YYYY-MM format
                    const today = new Date();
                    const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
                    setCurrentMonth(thisMonth);
                    
                    // Fetch categories from the current month
                    const categoriesPath = `manualBudget/${currentUser.uid}/months/${thisMonth}/categories`;
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

    const handleCategoryAdded = (newCategory) => {
        setCategories([...categories, newCategory]);
    };

    const handleRemoveCategory = () => {
        if (!selectedOption) return;
        openConfirmDialog();
    };

    const handleCategoryRemoved = (categoryName) => {
        setCategories(categories.filter(cat => cat !== categoryName));
        setSelectedOption('');
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                                <Button 
                                    variant="contained" 
                                    onClick={openAddCategoryModal}
                                    sx={{ height: 'fit-content' }}
                                >
                                    Add Category
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="error"
                                    onClick={handleRemoveCategory}
                                    disabled={!selectedOption}
                                    sx={{ height: 'fit-content' }}
                                >
                                    Remove Category
                                </Button>
                            </Box>
                            <Welcome name={name} />
                        </>
                    ) : (
                        [<LoginPrompt
                            openLoginModal={openLoginModal}
                            openSignUpModal={openSignUpModal}
                            loading={loading}
                            user={user}
                            key="login-prompt"
                        />]
                    ))}
                </Container>
                <Footer />
            </Box>
            
            {/* Authentication Modals */}
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
            
            {/* Add Category Modal */}
            <AddCategoryModal
                open={addCategoryModalOpen}
                onClose={closeAddCategoryModal}
                db={db}
                user={user}
                currentMonth={currentMonth}
                onCategoryAdded={handleCategoryAdded}
            />
            
            {/* Remove Category Dialog */}
            <RemoveCategoryDialog
                open={confirmDialogOpen}
                onClose={closeConfirmDialog}
                categoryName={selectedOption}
                db={db}
                user={user}
                currentMonth={currentMonth}
                onCategoryRemoved={handleCategoryRemoved}
            />
        </ThemeProvider>
    );
}
