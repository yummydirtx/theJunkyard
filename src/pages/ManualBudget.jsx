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
    Grid,
    Chip,
} from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import AppAppBar from '../components/AppAppBar';
import Footer from '../components/Footer';
import LoginModal from '../components/Authentication/LoginModal';
import SignUpModal from '../components/Authentication/SignUpModal';
import LoginPrompt from '../components/ManualBudget/LoginPrompt';
import { useTitle } from '../components/useTitle';
import Welcome from '../components/ManualBudget/Welcome';
import AddCategoryModal from '../components/ManualBudget/AddCategoryModal';
import EditCategoryModal from '../components/ManualBudget/EditCategoryModal';
import RemoveCategoryDialog from '../components/ManualBudget/RemoveCategoryDialog';
import CategorySelector from '../components/ManualBudget/CategorySelector';
import AddEntryModal from '../components/ManualBudget/AddEntryModal';
import EntryList from '../components/ManualBudget/EntryList';
import BudgetGraphsModal from '../components/ManualBudget/BudgetGraphsModal';
import MonthSelectorModal from '../components/ManualBudget/MonthSelectorModal';
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
        createUserDocument,
        setCurrentMonth,
        addNewMonth
    } = useManualBudgetData(app);

    const [selectedOption, setSelectedOption] = useState('');
    const [nameInput, setNameInput] = useState('');

    // Use custom hook for modal state management
    const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
    const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);
    const [addCategoryModalOpen, openAddCategoryModal, closeAddCategoryModal] = useModal(false);
    const [confirmDialogOpen, openConfirmDialog, closeConfirmDialog] = useModal(false);
    const [addEntryModalOpen, openAddEntryModal, closeAddEntryModal] = useModal(false);
    const [budgetGraphsModalOpen, openBudgetGraphsModal, closeBudgetGraphsModal] = useModal(false);
    const [monthSelectorOpen, openMonthSelector, closeMonthSelector] = useModal(false);
    const [editCategoryModalOpen, openEditCategoryModal, closeEditCategoryModal] = useModal(false);
    const [shouldRefreshGraphs, setShouldRefreshGraphs] = useState(false);

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

    const handleEditCategory = () => {
        if (!selectedOption) return;
        openEditCategoryModal();
    };

    const handleCategoryUpdated = (newCategoryName, oldCategoryName) => {
        // Update local categories list
        if (newCategoryName !== oldCategoryName) {
            const updatedCategories = categories.map(cat =>
                cat === oldCategoryName ? newCategoryName : cat
            );
            updateCategories(updatedCategories);
            setSelectedOption(newCategoryName);
        }

        // Signal that graphs should be refreshed
        setShouldRefreshGraphs(true);

        // Refresh entry list if category is selected
        if (entryListRef.current && selectedOption === oldCategoryName) {
            entryListRef.current.refreshEntries();
        }
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
        // Signal that graphs should be refreshed
        setShouldRefreshGraphs(true);
    };

    const handleMonthSelect = (month) => {
        // Update current month and reset selected category
        setCurrentMonth(month);
        setSelectedOption('');
        // Signal that graphs should be refreshed
        setShouldRefreshGraphs(true);
    };

    const handleOpenGraphsModal = () => {
        setShouldRefreshGraphs(false);
        openBudgetGraphsModal();
    };

    // Cleanup effect to reset refresh flag when modal closes
    useEffect(() => {
        if (!budgetGraphsModalOpen) {
            setShouldRefreshGraphs(false);
        }
    }, [budgetGraphsModalOpen]);

    // Reset state when authentication changes
    useEffect(() => {
        // Reset selected category and other UI state on auth change
        setSelectedOption('');
        setNameInput('');

        // Close any open modals related to user data
        closeAddCategoryModal();
        closeAddEntryModal();
        closeConfirmDialog();
        closeEditCategoryModal();
        closeBudgetGraphsModal();
        closeMonthSelector();
    }, [user]);

    // Format month string for display (YYYY-MM to Month YYYY)
    const formatMonth = (monthStr) => {
        try {
            const [year, month] = monthStr.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleString('default', { month: 'long', year: 'numeric' });
        } catch (e) {
            return monthStr;
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
                {/* Application container, fixed height */}
                <Container maxWidth="lg" sx={{ pt: { xs: 12, sm: 15 }, height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
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

                        {!loading && user && (
                            <Chip
                                icon={<CalendarMonthIcon />}
                                label={formatMonth(currentMonth)}
                                onClick={openMonthSelector}
                                color="primary"
                                variant="outlined"
                                sx={{
                                    mt: { xs: 2, sm: 2, md: 1 },
                                    fontSize: '1rem',
                                    height: 'auto',
                                    p: 0.5
                                }}
                            />
                        )}
                    </Box>

                    {!loading && (user ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                            <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
                                <Grid>
                                    <CategorySelector
                                        categories={categories}
                                        selectedOption={selectedOption}
                                        onCategoryChange={handleChange}
                                        onEditCategory={handleEditCategory}
                                    />
                                </Grid>
                                <Grid sx={{ mt: 1 }}>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Button
                                            variant="contained"
                                            onClick={openAddCategoryModal}
                                            startIcon={<AddCircleOutlineIcon />}
                                            sx={{ height: 'fit-content' }}
                                        >
                                            Add Category
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={handleRemoveCategory}
                                            startIcon={<DeleteOutlineIcon />}
                                            disabled={!selectedOption}
                                            sx={{ height: 'fit-content' }}
                                        >
                                            Remove Category
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<AddIcon />}
                                            disabled={!selectedOption}
                                            onClick={openAddEntryModal}
                                        >
                                            Add Entry
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<BarChartIcon />}
                                            onClick={handleOpenGraphsModal}
                                            sx={{ height: 'fit-content' }}
                                        >
                                            View Budget Graphs
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Flex container for main content - ensures proper space distribution */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
                                {/* Display entries for the selected category */}
                                {selectedOption ? (
                                    <EntryList
                                        ref={entryListRef}
                                        db={db}
                                        user={user}
                                        currentMonth={currentMonth}
                                        selectedCategory={selectedOption}
                                        sx={{ flexGrow: 1 }}
                                        mode={mode}
                                    />
                                ) : (
                                    <Welcome name={name} />
                                )}
                            </Box>
                        </Box>
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
                        color="primary"
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
                mode={mode}
            />

            {/* Budget Graphs Modal */}
            <BudgetGraphsModal
                open={budgetGraphsModalOpen}
                onClose={closeBudgetGraphsModal}
                db={db}
                user={user}
                currentMonth={currentMonth}
                selectedCategory={selectedOption}
                mode={mode}
                forceRefresh={shouldRefreshGraphs}
            />

            {/* Month Selector Modal */}
            <MonthSelectorModal
                open={monthSelectorOpen}
                onClose={closeMonthSelector}
                db={db}
                user={user}
                currentMonth={currentMonth}
                onMonthSelect={handleMonthSelect}
                mode={mode}
                addNewMonth={addNewMonth}
            />

            {/* Edit Category Modal */}
            <EditCategoryModal
                open={editCategoryModalOpen}
                onClose={closeEditCategoryModal}
                db={db}
                user={user}
                currentMonth={currentMonth}
                selectedCategory={selectedOption}
                onCategoryUpdated={handleCategoryUpdated}
            />
        </ThemeProvider>
    );
}
