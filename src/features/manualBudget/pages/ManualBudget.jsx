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

import RecurringExpenseModal from '../components/RecurringExpenseModal';
import useBudgetModals from '../hooks/useBudgetModals';
import useTitle from '../../../hooks/useTitle';

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
    const { activeUser, loading: authLoading, db, app } = useAuth();

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
    } = useManualBudgetDataService();

    const overallLoading = authLoading || dataLoading;

    const [selectedOption, setSelectedOption] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [shouldRefreshGraphs, setShouldRefreshGraphs] = useState(false);

    const entryListRef = useRef(null);

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
    const handleCategorySelectChange = useCallback((event) => {
        setSelectedOption(event.target.value);
    }, []);

    const handleCategoryAdded = useCallback((newCategory) => {
        updateCategories(prevCategories => [...prevCategories, newCategory]);
        addCategoryModal.close();
    }, [updateCategories, addCategoryModal]);

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

    const handleCategoryRemoved = useCallback(async (categoryName) => {
        updateCategories(prevCategories => prevCategories.filter(cat => cat.name !== categoryName));
        confirmDialog.close();
        fetchRecurringExpenseDefinitions(); // Refresh recurring expenses
    }, [updateCategories, confirmDialog, fetchRecurringExpenseDefinitions]);

    const handleCategoryUpdated = useCallback(async (newCategoryName, oldCategoryName) => {
        updateCategories(prevCategories => prevCategories.map(cat => cat.name === oldCategoryName ? { ...cat, name: newCategoryName } : cat));
        if (selectedOption === oldCategoryName) {
            setSelectedOption(newCategoryName);
        }
        editCategoryModal.close();
        fetchRecurringExpenseDefinitions(); // Refresh recurring expenses
    }, [selectedOption, updateCategories, editCategoryModal, fetchRecurringExpenseDefinitions]);

    const handleNameSubmit = useCallback(async () => {
        if (!nameInput.trim() || !activeUser) return;
        try {
            await createUserDocument(activeUser.uid, nameInput.trim());
        } catch (error) {
            console.error("Error setting user name:", error);
        }
    }, [nameInput, activeUser, createUserDocument]);

    const handleEntryAdded = useCallback(() => {
        setShouldRefreshGraphs(true); // Signal graphs to refresh
        addEntryModal.close();
    }, [addEntryModal]);

    const handleMonthSelect = useCallback(async (month) => {
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
                    onOpenRecurringExpenseModal={openRecurringExpenseModal}
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
                        open={addCategoryModal.open}
                        onClose={addCategoryModal.close}
                        db={db}
                        user={activeUser}
                        currentMonth={currentMonth}
                        onCategoryAdded={handleCategoryAdded}
                    />
                    <RemoveCategoryDialog
                        open={confirmDialog.open}
                        onClose={confirmDialog.close}
                        categoryName={selectedOption}
                        db={db}
                        user={activeUser}
                        currentMonth={currentMonth}
                        onCategoryRemoved={handleCategoryRemoved}
                    />
                    <AddEntryModal
                        open={addEntryModal.open}
                        onClose={addEntryModal.close}
                        db={db}
                        user={activeUser}
                        currentMonth={currentMonth}
                        selectedCategory={selectedOption}
                        onEntryAdded={handleEntryAdded}
                        mode={mode}
                    />
                    <BudgetGraphsModal
                        open={budgetGraphsModal.open}
                        onClose={budgetGraphsModal.close}
                        db={db}
                        user={activeUser}
                        currentMonth={currentMonth}
                        selectedCategory={selectedOption}
                        mode={mode}
                        forceRefresh={shouldRefreshGraphs}
                    />
                    <MonthSelectorModal
                        open={monthSelectorModal.open}
                        onClose={monthSelectorModal.close}
                        db={db}
                        user={activeUser}
                        currentMonth={currentMonth}
                        onMonthSelect={handleMonthSelect}
                        mode={mode}
                        addNewMonth={addNewMonth}
                    />
                    <EditCategoryModal
                        open={editCategoryModal.open}
                        onClose={editCategoryModal.close}
                        db={db}
                        user={activeUser}
                        currentMonth={currentMonth}
                        selectedCategory={selectedOption}
                        onCategoryUpdated={handleCategoryUpdated}
                    />
                    {/* --- Render the new RecurringExpenseModal --- */}
                    <RecurringExpenseModal
                        open={recurringExpenseModal.open}
                        onClose={recurringExpenseModal.close}
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
