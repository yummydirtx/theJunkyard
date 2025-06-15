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

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useTitle } from '../../../hooks/useTitle';
import { useAuth } from '../../../contexts/AuthContext';
import useManualBudgetDataQuery from '../hooks/useManualBudgetDataQuery';
import useBudgetModals from '../hooks/useBudgetModals';
import LoginPrompt from '../../../components/common/LoginPrompt';
import PageLayout from '../../../components/layout/PageLayout';
import BudgetPageHeader from '../components/BudgetPageHeader';
import BudgetActionsBar from '../components/BudgetActionsBar';
import EntryListWithQuery from '../components/EntryListWithQuery';
import Welcome from '../components/Welcome';
import NamePromptDialog from '../components/NamePromptDialog';
import LoginModal from '../../authentication/components/LoginModal';
import SignUpModal from '../../authentication/components/SignUpModal';
import AddCategoryModal from '../components/AddCategoryModal';
import RemoveCategoryDialog from '../components/RemoveCategoryDialog';
import AddEntryModalWithQuery from '../components/AddEntryModalWithQuery';
import BudgetGraphsModal from '../components/BudgetGraphsModal';
import MonthSelectorModal from '../components/MonthSelectorModal';
import EditCategoryModalWithQuery from '../components/EditCategoryModalWithQuery';
import RecurringExpenseModal from '../components/RecurringExpenseModal';

interface ManualBudgetProps {
  setMode: (mode: 'light' | 'dark') => void;
  mode: 'light' | 'dark';
}

/**
 * Manual Budget page component using TanStack Query
 * This demonstrates the new query-based approach for data management
 */
export default function ManualBudgetWithQuery({ setMode, mode }: ManualBudgetProps) {
  useTitle('theJunkyard: Manual Budget');
  const { activeUser, loading: authLoading, db, app } = useAuth();

  // TanStack Query hook - provides automatic caching, loading states, and optimistic updates
  const {
    loading: dataLoading,
    name,
    categories,
    currentMonth,
    totalSpent,
    totalBudget,
    totalIncome,
    remainingBudget,
    entries,
    needsNamePrompt,
    createUserDocument,
    setCurrentMonth,
    addNewMonth,
    recurringExpensesList,
    addRecurringExpenseDefinition,
    deleteRecurringExpenseDefinition,
    // Additional loading states from TanStack Query
    isUpdatingCategories,
    isAddingNewMonth,
    isCreatingUser,
    // Utility functions
    refetchSummary,
  } = useManualBudgetDataQuery();

  // Modal states managed by useBudgetModals hook
  const {
    loginModal,
    signUpModal,
    addCategoryModal,
    confirmDialog,
    addEntryModal,
    budgetGraphsModal,
    monthSelectorModal,
    editCategoryModal,
    recurringExpenseModal
  } = useBudgetModals();

  const overallLoading = authLoading || dataLoading;

  const [selectedOption, setSelectedOption] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [shouldRefreshGraphs, setShouldRefreshGraphs] = useState(false);

  const entryListRef = useRef<any>(null);

  // Effect to close modals if user logs out or auth state is still loading
  useEffect(() => {
    if (!activeUser || authLoading) {
      addCategoryModal.close();
      addEntryModal.close();
      confirmDialog.close();
      editCategoryModal.close();
      budgetGraphsModal.close();
      monthSelectorModal.close();
      recurringExpenseModal.close();
    }
  }, [
    activeUser, authLoading, addCategoryModal, addEntryModal, confirmDialog, editCategoryModal,
    budgetGraphsModal, monthSelectorModal, recurringExpenseModal
  ]);

  // Effect to reset local state when user changes
  useEffect(() => {
    setSelectedOption('');
    setNameInput('');
  }, [activeUser]);

  // --- Event Handlers ---
  const handleCategorySelectChange = useCallback((event: any) => {
    setSelectedOption(event.target.value);
  }, []);

  const handleCategoryAdded = useCallback((newCategory: any) => {
    // No need to manually update categories - TanStack Query will refetch automatically
    setShouldRefreshGraphs(true); // Signal graphs to refresh
    addCategoryModal.close();
  }, [addCategoryModal]);

  const handleOpenRemoveCategoryDialog = useCallback(() => {
    if (selectedOption) {
      confirmDialog.open();
    }
  }, [selectedOption, confirmDialog]);

  const handleOpenEditCategoryModal = useCallback(() => {
    if (selectedOption) {
      editCategoryModal.open();
    }
  }, [selectedOption, editCategoryModal]);

  const handleCategoryRemoved = useCallback(async (categoryName: string) => {
    // No need to manually update categories - TanStack Query will refetch automatically
    setShouldRefreshGraphs(true); // Signal graphs to refresh
    confirmDialog.close();
    // Clear selection if the removed category was selected
    if (selectedOption === categoryName) {
      setSelectedOption('');
    }
  }, [selectedOption, confirmDialog]);

  const handleCategoryUpdated = useCallback(async (newCategoryName: string, oldCategoryName: string) => {
    // No need to manually update categories - TanStack Query will refetch automatically
    setShouldRefreshGraphs(true); // Signal graphs to refresh
    if (selectedOption === oldCategoryName) {
      setSelectedOption(newCategoryName);
    }
    editCategoryModal.close();
  }, [selectedOption, editCategoryModal]);

  const handleNameSubmit = useCallback(async () => {
    if (!nameInput.trim() || !activeUser) return;
    try {
      await createUserDocument(nameInput.trim());
    } catch (error) {
      console.error("Error setting user name:", error);
    }
  }, [nameInput, activeUser, createUserDocument]);

  const handleEntryAdded = useCallback(() => {
    setShouldRefreshGraphs(true); // Signal graphs to refresh
    // The TanStack Query mutation in AddEntryModalWithQuery will handle cache updates automatically
    addEntryModal.close();
  }, [addEntryModal]);

  const handleMonthSelect = useCallback(async (month: string) => {
    await setCurrentMonth(month);
    monthSelectorModal.close();
    setShouldRefreshGraphs(true); // Refresh graphs for new month
  }, [setCurrentMonth, monthSelectorModal]);

  const handleOpenGraphsModal = useCallback(() => {
    budgetGraphsModal.open();
  }, [budgetGraphsModal]);

  useEffect(() => {
    if (budgetGraphsModal.isOpen) {
      setShouldRefreshGraphs(false); // Reset refresh flag when modal opens
    }
  }, [budgetGraphsModal.isOpen]);

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
          openLoginModal={loginModal.open}
          openSignUpModal={signUpModal.open}
          loading={authLoading}
          user={activeUser}
          app_title="Manual Budget"
        />
      );
    }

    if (activeUser && needsNamePrompt) {
      return null; // NamePromptDialog is rendered outside this function
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
        <BudgetActionsBar
          categories={categories.map(cat => cat.name)}
          selectedOption={selectedOption}
          onCategoryChange={handleCategorySelectChange}
          onEditCategory={handleOpenEditCategoryModal}
          onOpenAddCategoryModal={addCategoryModal.open}
          onRemoveCategory={handleOpenRemoveCategoryDialog}
          onOpenAddEntryModal={addEntryModal.open}
          onOpenGraphsModal={handleOpenGraphsModal}
          onOpenRecurringExpenseModal={recurringExpenseModal.open}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
          {selectedOption ? (
            <EntryListWithQuery
              ref={entryListRef}
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
        <BudgetPageHeader
          currentMonth={currentMonth}
          onMonthChipClick={monthSelectorModal.open}
          loading={overallLoading}
          activeUser={activeUser || {}}
        />
        {renderContent()}
        
        {/* Modals */}
        {activeUser && needsNamePrompt && (
          <NamePromptDialog
            open={needsNamePrompt}
            nameInput={nameInput}
            onNameInputChange={(event: React.ChangeEvent<HTMLInputElement>) => setNameInput(event.target.value)}
            onSubmitName={handleNameSubmit}
            loading={isCreatingUser}
          />
        )}
        <LoginModal
          open={loginModal.isOpen}
          onClose={loginModal.close}
          app={app}
        />
        <SignUpModal
          open={signUpModal.isOpen}
          onClose={signUpModal.close}
          app={app}
        />
        {activeUser && (
          <>
            <AddCategoryModal
              open={addCategoryModal.isOpen}
              onClose={addCategoryModal.close}
              db={db}
              user={activeUser}
              currentMonth={currentMonth}
              onCategoryAdded={handleCategoryAdded}
            />
            <RemoveCategoryDialog
              open={confirmDialog.isOpen}
              onClose={confirmDialog.close}
              categoryName={selectedOption}
              db={db}
              user={activeUser}
              currentMonth={currentMonth}
              onCategoryRemoved={handleCategoryRemoved}
            />
            <AddEntryModalWithQuery
              open={addEntryModal.isOpen}
              onClose={addEntryModal.close}
              currentMonth={currentMonth}
              selectedCategory={selectedOption}
              onEntryAdded={handleEntryAdded}
              mode={mode}
            />
            <BudgetGraphsModal
              open={budgetGraphsModal.isOpen}
              onClose={budgetGraphsModal.close}
              db={db}
              user={activeUser}
              currentMonth={currentMonth}
              selectedCategory={selectedOption}
              mode={mode}
              shouldRefreshGraphs={shouldRefreshGraphs}
              onGraphsRefreshed={() => setShouldRefreshGraphs(false)}
            />
            <MonthSelectorModal
              open={monthSelectorModal.isOpen}
              onClose={monthSelectorModal.close}
              db={db}
              user={activeUser}
              currentMonth={currentMonth}
              onMonthSelect={handleMonthSelect}
              mode={mode}
              addNewMonth={addNewMonth}
            />
            <EditCategoryModalWithQuery
              open={editCategoryModal.isOpen}
              onClose={editCategoryModal.close}
              selectedCategory={selectedOption}
              currentMonth={currentMonth}
              onCategoryUpdated={handleCategoryUpdated}
            />
            <RecurringExpenseModal
              open={recurringExpenseModal.isOpen}
              onClose={recurringExpenseModal.close}
              categories={categories.map(cat => cat.name)}
              db={db}
              user={activeUser}
              recurringExpensesList={recurringExpensesList}
              addRecurringExpenseDefinition={addRecurringExpenseDefinition}
              deleteRecurringExpenseDefinition={deleteRecurringExpenseDefinition}
              fetchRecurringExpenseDefinitions={async () => recurringExpensesList}
            />
          </>
        )}

        {/* Loading States Display */}
        {(isUpdatingCategories || isAddingNewMonth || isCreatingUser) && (
          <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">
                {isUpdatingCategories && 'Updating categories...'}
                {isAddingNewMonth && 'Creating new month...'}
                {isCreatingUser && 'Creating user...'}
              </Typography>
            </Box>
          </Box>
        )}
      </Container>
    </PageLayout>
  );
}
