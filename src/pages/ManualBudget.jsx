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
    Container,
    CircularProgress,
} from '@mui/material';
import { useState, useRef, useEffect, useCallback } from 'react';
import { alpha } from '@mui/material/styles';

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
import AddEntryModal from '../components/ManualBudget/AddEntryModal';
import EntryList from '../components/ManualBudget/EntryList';
import BudgetGraphsModal from '../components/ManualBudget/BudgetGraphsModal';
import MonthSelectorModal from '../components/ManualBudget/MonthSelectorModal';
import BudgetPageHeader from '../components/ManualBudget/BudgetPageHeader';
import BudgetActionsBar from '../components/ManualBudget/BudgetActionsBar';
import NamePromptDialog from '../components/ManualBudget/NamePromptDialog';

import useModal from '../hooks/useModal';
import useManualBudgetData from '../hooks/useManualBudgetData';
import { useAuth } from '../contexts/AuthContext';

/**
 * ManualBudget component provides a user interface for managing a personal budget.
 * It allows users to create categories, add expense/income entries,
 * view data in graphs, and manage data across different months.
 * Authentication is required to access and save budget data.
 * @param {object} props - The component's props.
 * @param {function} props.setMode - Function to toggle the color mode (light/dark).
 * @param {string} props.mode - The current color mode ('light' or 'dark').
 */
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
        addNewMonth,
    } = useManualBudgetData();

    const overallLoading = authLoading || dataLoading;

    const [selectedOption, setSelectedOption] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [shouldRefreshGraphs, setShouldRefreshGraphs] = useState(false);

    const entryListRef = useRef(null);

    // Modal states
    const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
    const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);
    const [addCategoryModalOpen, openAddCategoryModal, closeAddCategoryModal] = useModal(false);
    const [confirmDialogOpen, openConfirmDialog, closeConfirmDialog] = useModal(false);
    const [addEntryModalOpen, openAddEntryModal, closeAddEntryModal] = useModal(false);
    const [budgetGraphsModalOpen, openBudgetGraphsModal, closeBudgetGraphsModal] = useModal(false);
    const [monthSelectorOpen, openMonthSelector, closeMonthSelector] = useModal(false);
    const [editCategoryModalOpen, openEditCategoryModal, closeEditCategoryModal] = useModal(false);

    // Effect to close modals if user logs out or auth state is still loading
    useEffect(() => {
        if (!activeUser && !authLoading) {
            const modalsToClose = [
                closeAddCategoryModal, closeAddEntryModal, closeConfirmDialog,
                closeEditCategoryModal, closeBudgetGraphsModal, closeMonthSelector,
            ];
            modalsToClose.forEach(closeModal => closeModal());
            setSelectedOption(''); // Reset selection if user logs out
        }
    }, [
        activeUser, authLoading, closeAddCategoryModal, closeAddEntryModal,
        closeConfirmDialog, closeEditCategoryModal, closeBudgetGraphsModal, closeMonthSelector
    ]);
    
    // Effect to reset local state when user changes
    useEffect(() => {
        setSelectedOption('');
        setNameInput('');
         // Keep modals open/closed based on their individual state,
         // but ensure selection/input is reset for a new user.
    }, [activeUser]);

    // --- Event Handlers ---
    const handleCategorySelectChange = useCallback((event) => {
        setSelectedOption(event.target.value);
    }, []);

    const handleCategoryAdded = useCallback((newCategory) => {
        updateCategories(prevCategories => [...prevCategories, newCategory]);
        setSelectedOption(newCategory);
        setShouldRefreshGraphs(true);
    }, [updateCategories]);

    const handleOpenRemoveCategoryDialog = useCallback(() => {
        if (!selectedOption) return;
        openConfirmDialog();
    }, [selectedOption, openConfirmDialog]);

    const handleOpenEditCategoryModal = useCallback(() => {
        if (!selectedOption) return;
        openEditCategoryModal();
    }, [selectedOption, openEditCategoryModal]);

    const handleCategoryRemoved = useCallback((categoryName) => {
        updateCategories(prevCategories => prevCategories.filter(cat => cat !== categoryName));
        setSelectedOption('');
        setShouldRefreshGraphs(true);
    }, [updateCategories]);

    const handleCategoryUpdated = useCallback((newCategoryName, oldCategoryName) => {
        updateCategories(prevCategories => prevCategories.map(cat => (cat === oldCategoryName ? newCategoryName : cat)));
        if (selectedOption === oldCategoryName) {
            setSelectedOption(newCategoryName);
        }
        setShouldRefreshGraphs(true);
        closeEditCategoryModal();
    }, [selectedOption, updateCategories, closeEditCategoryModal]);

    const handleNameSubmit = useCallback(async () => {
        if (!nameInput.trim() || !activeUser) return;
        try {
            await createUserDocument(activeUser.uid, nameInput.trim());
            // Name state and needsNamePrompt are updated by the useManualBudgetData hook
        } catch (error) {
            console.error("Error setting user name:", error);
        }
    }, [nameInput, activeUser, createUserDocument]);

    const handleEntryAdded = useCallback(() => {
        if (entryListRef.current) {
            entryListRef.current.refreshEntries();
        }
        setShouldRefreshGraphs(true);
    }, []);

    const handleMonthSelect = useCallback(async (month) => {
        await setCurrentMonth(month); // setCurrentMonth also fetches categories for the new month
        setSelectedOption(''); // Reset category selection for the new month
        setShouldRefreshGraphs(true);
    }, [setCurrentMonth]);

    const handleOpenGraphsModal = useCallback(() => {
        setShouldRefreshGraphs(false); // Reset refresh flag before opening graphs
        openBudgetGraphsModal();
    }, [openBudgetGraphsModal]);

    // Reset refresh flag when graphs modal is closed to prevent unnecessary re-renders
    useEffect(() => {
        if (!budgetGraphsModalOpen) {
            setShouldRefreshGraphs(false);
        }
    }, [budgetGraphsModalOpen]);


    // --- Render Logic ---
    const renderContent = () => {
        if (overallLoading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!activeUser) {
            return (
                <LoginPrompt
                    openLoginModal={openLoginModal}
                    openSignUpModal={openSignUpModal}
                    loading={authLoading}
                    user={activeUser}
                    app_title="Manual Budget"
                />
            );
        }
        
        if (needsNamePrompt) {
             return null; // NamePromptDialog is rendered outside this function
        }

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                <BudgetActionsBar
                    categories={categories}
                    selectedOption={selectedOption}
                    onCategoryChange={handleCategorySelectChange}
                    onEditCategory={handleOpenEditCategoryModal}
                    onOpenAddCategoryModal={openAddCategoryModal}
                    onRemoveCategory={handleOpenRemoveCategoryDialog}
                    onOpenAddEntryModal={openAddEntryModal}
                    onOpenGraphsModal={handleOpenGraphsModal}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
                    {selectedOption ? (
                        <EntryList
                            ref={entryListRef}
                            db={db}
                            user={activeUser}
                            currentMonth={currentMonth}
                            selectedCategory={selectedOption}
                            mode={mode}
                        />
                    ) : (
                        <Welcome name={name} />
                    )}
                </Box>
            </Box>
        );
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
                            : `linear-gradient(#02294F, ${alpha(theme.palette.background.default, 0.0)})`,
                    backgroundSize: '100% 10%', // Adjusted for visual preference
                    backgroundRepeat: 'no-repeat',
                    minHeight: '100vh', // Ensure it covers viewport height
                    display: 'flex',
                    flexDirection: 'column'
                })}
            >
                <Container maxWidth="lg" sx={{ 
                    pt: { xs: 12, sm: 15 }, 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {!overallLoading && activeUser && !needsNamePrompt && (
                         <BudgetPageHeader
                            currentMonth={currentMonth}
                            onMonthChipClick={openMonthSelector}
                            loading={overallLoading}
                            activeUser={activeUser}
                        />
                    )}
                    {renderContent()}
                </Container>
                <Footer />
            </Box>

            {/* Modals */}
            {!overallLoading && activeUser && needsNamePrompt && (
                <NamePromptDialog
                    open={needsNamePrompt}
                    nameInput={nameInput}
                    onNameInputChange={(e) => setNameInput(e.target.value)}
                    onSubmitName={handleNameSubmit}
                    loading={dataLoading}
                />
            )}

            <LoginModal open={loginModalOpen} onClose={closeLoginModal} />
            <SignUpModal open={signUpModalOpen} onClose={closeSignUpModal} />

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