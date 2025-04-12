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
    CircularProgress,
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
import { useAuth } from '../contexts/AuthContext';

export default function ManualBudget({ setMode, mode }) {
    useTitle('theJunkyard: Manual Budget');
    const defaultTheme = createTheme({ palette: { mode } });
    const { activeUser, loading: authLoading, db } = useAuth();

    const {
        loading: dataLoading,
        name,
        categories,
        currentMonth,
        updateCategories,
        needsNamePrompt,
        createUserDocument,
        setCurrentMonth,
        addNewMonth
    } = useManualBudgetData();

    const loading = authLoading || dataLoading;

    const [selectedOption, setSelectedOption] = useState('');
    const [nameInput, setNameInput] = useState('');

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

    useEffect(() => {
        if (!activeUser && !authLoading) {
            closeAddCategoryModal();
            closeAddEntryModal();
            closeConfirmDialog();
            closeEditCategoryModal();
            closeBudgetGraphsModal();
            closeMonthSelector();
        }
    }, [activeUser, authLoading]);

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

    const handleCategoryRemoved = (categoryName) => {
        updateCategories(categories.filter(cat => cat !== categoryName));
        setSelectedOption('');
    };

    const handleCategoryUpdated = (newCategoryName, oldCategoryName) => {
        updateCategories(categories.map(cat => cat === oldCategoryName ? newCategoryName : cat));
        if (selectedOption === oldCategoryName) {
            setSelectedOption(newCategoryName);
        }
        setShouldRefreshGraphs(true);
        closeEditCategoryModal();
    };

    const handleNameSubmit = async () => {
        if (!nameInput.trim() || !activeUser) return;
        try {
            await createUserDocument(activeUser.uid, nameInput.trim());
        } catch (error) {
            console.error("Error setting user name:", error);
        }
    };

    const handleEntryAdded = () => {
        if (entryListRef.current) {
            entryListRef.current.refreshEntries();
        }
        setShouldRefreshGraphs(true);
    };

    const handleMonthSelect = (month) => {
        setCurrentMonth(month);
        setSelectedOption('');
        setShouldRefreshGraphs(true);
    };

    const handleOpenGraphsModal = () => {
        setShouldRefreshGraphs(false);
        openBudgetGraphsModal();
    };

    useEffect(() => {
        if (!budgetGraphsModalOpen) {
            setShouldRefreshGraphs(false);
        }
    }, [budgetGraphsModalOpen]);

    useEffect(() => {
        setSelectedOption('');
        setNameInput('');
        closeAddCategoryModal();
        closeAddEntryModal();
        closeConfirmDialog();
        closeEditCategoryModal();
        closeBudgetGraphsModal();
        closeMonthSelector();
    }, [activeUser]);

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
            <AppAppBar mode={mode} toggleColorMode={setMode} />
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

                        {!loading && activeUser && (
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

                    {!loading && (activeUser ? (
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

                            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
                                {selectedOption ? (
                                    <EntryList
                                        ref={entryListRef}
                                        db={db}
                                        user={activeUser}
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
                            user={activeUser}
                            key="login-prompt"
                        />]
                    ))}
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                            <CircularProgress />
                        </Box>
                    )}
                </Container>
                <Footer />
            </Box>

            <Dialog open={needsNamePrompt && !loading && activeUser} onClose={() => { }}>
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

            <LoginModal
                open={loginModalOpen}
                onClose={closeLoginModal}
            />
            <SignUpModal
                open={signUpModalOpen}
                onClose={closeSignUpModal}
            />

            {activeUser && db && (
                <>
                    <AddCategoryModal
                        open={addCategoryModalOpen}
                        onClose={closeAddCategoryModal}
                        db={db}
                        user={activeUser}
                        currentMonth={currentMonth}
                        onCategoryAdded={handleCategoryAdded}
                    />
                    <RemoveCategoryDialog
                        open={confirmDialogOpen}
                        onClose={closeConfirmDialog}
                        categoryName={selectedOption}
                        db={db}
                        user={activeUser}
                        currentMonth={currentMonth}
                        onCategoryRemoved={handleCategoryRemoved}
                    />
                    <AddEntryModal
                        open={addEntryModalOpen}
                        onClose={closeAddEntryModal}
                        db={db}
                        user={activeUser}
                        currentMonth={currentMonth}
                        selectedCategory={selectedOption}
                        onEntryAdded={handleEntryAdded}
                        mode={mode}
                    />
                    <BudgetGraphsModal
                        open={budgetGraphsModalOpen}
                        onClose={closeBudgetGraphsModal}
                        db={db}
                        user={activeUser}
                        currentMonth={currentMonth}
                        selectedCategory={selectedOption}
                        mode={mode}
                        forceRefresh={shouldRefreshGraphs}
                    />
                    <MonthSelectorModal
                        open={monthSelectorOpen}
                        onClose={closeMonthSelector}
                        db={db}
                        user={activeUser}
                        currentMonth={currentMonth}
                        onMonthSelect={handleMonthSelect}
                        mode={mode}
                        addNewMonth={addNewMonth}
                    />
                    <EditCategoryModal
                        open={editCategoryModalOpen}
                        onClose={closeEditCategoryModal}
                        db={db}
                        user={activeUser}
                        currentMonth={currentMonth}
                        selectedCategory={selectedOption}
                        onCategoryUpdated={handleCategoryUpdated}
                    />
                </>
            )}
        </ThemeProvider>
    );
}
