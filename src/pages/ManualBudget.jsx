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
    Container,
    CircularProgress,
} from '@mui/material';
import { useState, useRef, useEffect, useCallback } from 'react';

import PageLayout from '../components/PageLayout';
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
import RecurringExpenseModal from '../components/ManualBudget/RecurringExpenseModal'; // Import the new modal

import useModal from '../hooks/useModal';
import useManualBudgetData from '../hooks/useManualBudgetData';
import { useAuth } from '../contexts/AuthContext';

/**
 * ManualBudget component provides a user interface for managing a personal budget.
 * It allows users to create categories, add expense/income entries,
 * view data in graphs, manage data across different months, and define recurring expenses.
 * Authentication is required to access and save budget data.
 * @param {object} props - The component's props.
 * @param {function} props.setMode - Function to toggle the color mode (light/dark).
 * @param {string} props.mode - The current color mode ('light' or 'dark').
 */
export default function ManualBudget({ setMode, mode }) {
    useTitle('theJunkyard: Manual Budget');
    const { activeUser, loading: authLoading, db, app } = useAuth(); // Added app for modals

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
        // --- Destructure new items from hook ---
        recurringExpensesList,
        fetchRecurringExpenseDefinitions,
        addRecurringExpenseDefinition,
        deleteRecurringExpenseDefinition,
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
    // --- New modal state for Recurring Expenses ---
    const [recurringExpenseModalOpen, openRecurringExpenseModal, closeRecurringExpenseModal] = useModal(false);

    // Effect to close modals if user logs out or auth state is still loading
    useEffect(() => {
        if (!activeUser && !authLoading) {
            const modalsToClose = [
                closeAddCategoryModal, closeAddEntryModal, closeConfirmDialog,
                closeEditCategoryModal, closeBudgetGraphsModal, closeMonthSelector,
                closeRecurringExpenseModal, // Close new modal on logout
            ];
            modalsToClose.forEach(closeModal => closeModal());
            setSelectedOption(''); // Reset selection if user logs out
        }
    }, [
        activeUser, authLoading, closeAddCategoryModal, closeAddEntryModal,
        closeConfirmDialog, closeEditCategoryModal, closeBudgetGraphsModal, closeMonthSelector,
        closeRecurringExpenseModal // Add to dependency array
    ]);

    // Effect to reset local state when user changes
    useEffect(() => {
        setSelectedOption('');
        setNameInput('');
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

    const handleCategoryRemoved = useCallback(async (categoryName) => {
        updateCategories(prevCategories => prevCategories.filter(cat => cat !== categoryName));
        setSelectedOption('');
        setShouldRefreshGraphs(true);
        // Consider implications for recurring expenses linked to this category
        if (fetchRecurringExpenseDefinitions) {
            await fetchRecurringExpenseDefinitions(); // Refresh list in case some were auto-handled
        }
    }, [updateCategories, fetchRecurringExpenseDefinitions]);

    const handleCategoryUpdated = useCallback(async (newCategoryName, oldCategoryName) => {
        updateCategories(prevCategories => prevCategories.map(cat => (cat === oldCategoryName ? newCategoryName : cat)));
        if (selectedOption === oldCategoryName) {
            setSelectedOption(newCategoryName);
        }
        setShouldRefreshGraphs(true);
        closeEditCategoryModal();
        // If a category name changes, existing recurring expenses linked to the old name
        // will need to be updated manually by the user for now.
        if (fetchRecurringExpenseDefinitions) {
           await fetchRecurringExpenseDefinitions(); // Refresh list
        }
    }, [selectedOption, updateCategories, closeEditCategoryModal, fetchRecurringExpenseDefinitions]);

    const handleNameSubmit = useCallback(async () => {
        if (!nameInput.trim() || !activeUser) return;
        try {
            await createUserDocument(activeUser.uid, nameInput.trim());
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
        await setCurrentMonth(month);
        setSelectedOption('');
        setShouldRefreshGraphs(true);
    }, [setCurrentMonth]);

    const handleOpenGraphsModal = useCallback(() => {
        setShouldRefreshGraphs(false);
        openBudgetGraphsModal();
    }, [openBudgetGraphsModal]);

    useEffect(() => {
        if (!budgetGraphsModalOpen) {
            setShouldRefreshGraphs(false);
        }
    }, [budgetGraphsModalOpen]);


    // --- Render Logic ---
    const renderContent = () => {
        if (overallLoading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, height: '50vh' }}>
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
                    onOpenRecurringExpenseModal={openRecurringExpenseModal} // Pass handler
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
        <PageLayout mode={mode} setMode={setMode}>
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
                        loading={overallLoading} // Pass overallLoading
                        activeUser={activeUser}
                    />
                )}
                {renderContent()}
            </Container>

            {!overallLoading && activeUser && needsNamePrompt && (
                <NamePromptDialog
                    open={needsNamePrompt}
                    nameInput={nameInput}
                    onNameInputChange={(e) => setNameInput(e.target.value)}
                    onSubmitName={handleNameSubmit}
                    loading={dataLoading} // Use dataLoading for this specific action
                />
            )}

            <LoginModal open={loginModalOpen} onClose={closeLoginModal} app={app} />
            <SignUpModal open={signUpModalOpen} onClose={closeSignUpModal} app={app} />

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
                    {/* --- Render the new RecurringExpenseModal --- */}
                    <RecurringExpenseModal
                        open={recurringExpenseModalOpen}
                        onClose={closeRecurringExpenseModal}
                        db={db}
                        user={activeUser}
                        categories={categories}
                        addRecurringExpenseDefinition={addRecurringExpenseDefinition}
                        recurringExpensesList={recurringExpensesList}
                        fetchRecurringExpenseDefinitions={fetchRecurringExpenseDefinitions}
                        deleteRecurringExpenseDefinition={deleteRecurringExpenseDefinition}
                    />
                </>
            )}
        </PageLayout>
    );
}
