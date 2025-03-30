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

import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
    Box,
    CssBaseline,
    Typography,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid2,
} from '@mui/material';
import { useState, useRef } from 'react';
import { alpha } from '@mui/material/styles';
import AppAppBar from '../components/AppAppBar';
import Footer from '../components/Footer';
import LoginModal from '../components/Authentication/LoginModal';
import SignUpModal from '../components/Authentication/SignUpModal';
import LoginPrompt from '../components/ManualBudget/LoginPrompt';
import { useTitle } from '../components/useTitle';
import Welcome from '../components/ManualBudget/Welcome';
import AddCategoryModal from '../components/ManualBudget/AddCategoryModal';
import RemoveCategoryDialog from '../components/ManualBudget/RemoveCategoryDialog';
import CategorySelector from '../components/ManualBudget/CategorySelector';
import AddEntryModal from '../components/ManualBudget/AddEntryModal';
import EntryList from '../components/ManualBudget/EntryList';
import useModal from '../hooks/useModal';
import useManualBudgetData from '../hooks/useManualBudgetData';

export default function ManualBudget({ setMode, mode, app }) {
    useTitle('theJunkyard: Manual Budget');
    const defaultTheme = createTheme({ palette: { mode } });

    // Use custom hook for data fetching and authentication
    const {
        user,
        loading,
        name,
        categories,
        currentMonth,
        db,
        updateCategories,
        needsNamePrompt,
        createUserDocument
    } = useManualBudgetData(app);

    const [selectedOption, setSelectedOption] = useState('');
    const [nameInput, setNameInput] = useState('');

    // Use custom hook for modal state management
    const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
    const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);
    const [addCategoryModalOpen, openAddCategoryModal, closeAddCategoryModal] = useModal(false);
    const [confirmDialogOpen, openConfirmDialog, closeConfirmDialog] = useModal(false);
    const [addEntryModalOpen, openAddEntryModal, closeAddEntryModal] = useModal(false);

    const entryListRef = useRef(null);

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleCategoryAdded = (newCategory) => {
        updateCategories([...categories, newCategory]);
    };

    const handleRemoveCategory = () => {
        if (!selectedOption) return;
        openConfirmDialog();
    };

    const handleCategoryRemoved = (categoryName) => {
        updateCategories(categories.filter(cat => cat !== categoryName));
        setSelectedOption('');
    };

    const handleNameSubmit = () => {
        if (nameInput.trim()) {
            createUserDocument(nameInput.trim());
        }
    };

    const handleEntryAdded = () => {
        // Refresh entries list after adding a new entry
        if (entryListRef.current) {
            entryListRef.current.refreshEntries();
        }
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
                {/* Application container, stays constant height */}
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
                            <Grid2 container spacing={2} sx={{ mb: 3 }}>
                                <Grid2 item xs={12}>
                                    <CategorySelector
                                        categories={categories}
                                        selectedOption={selectedOption}
                                        onCategoryChange={handleChange}

                                    />
                                </Grid2>
                                <Grid2 item xs={12} sx={{ mt: 1 }}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            disabled={!selectedOption}
                                            onClick={openAddEntryModal}
                                        >
                                            Add Entry
                                        </Button>
                                    </Box>
                                </Grid2>
                            </Grid2>
                            
                            {/* Display entries for the selected category */}
                            {selectedOption && (
                                <EntryList 
                                    ref={entryListRef}
                                    db={db}
                                    user={user}
                                    currentMonth={currentMonth}
                                    selectedCategory={selectedOption}
                                />
                            )}
                            
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

            {/* Name Prompt Dialog */}
            <Dialog open={needsNamePrompt && !loading && user} onClose={() => { }}>
                <DialogTitle>Welcome to Manual Budget</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Please enter your name to get started:
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Your Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleNameSubmit}
                        variant="contained"
                        disabled={!nameInput.trim()}
                    >
                        Start Budgeting
                    </Button>
                </DialogActions>
            </Dialog>

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

            {/* Add Entry Modal */}
            <AddEntryModal
                open={addEntryModalOpen}
                onClose={closeAddEntryModal}
                db={db}
                user={user}
                currentMonth={currentMonth}
                selectedCategory={selectedOption}
                onEntryAdded={handleEntryAdded}
            />
        </ThemeProvider>
    );
}
