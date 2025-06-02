// /Users/alexfrutkin/Documents/Code/theJunkyard/src/features/manualBudget/hooks/useBudgetModals.js
import useModal from '../../../hooks/useModal';

export default function useBudgetModals() {
    const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
    const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);
    const [addCategoryModalOpen, openAddCategoryModal, closeAddCategoryModal] = useModal(false);
    const [confirmDialogOpen, openConfirmDialog, closeConfirmDialog] = useModal(false);
    const [addEntryModalOpen, openAddEntryModal, closeAddEntryModal] = useModal(false);
    const [budgetGraphsModalOpen, openBudgetGraphsModal, closeBudgetGraphsModal] = useModal(false);
    const [monthSelectorOpen, openMonthSelector, closeMonthSelector] = useModal(false);
    const [editCategoryModalOpen, openEditCategoryModal, closeEditCategoryModal] = useModal(false);
    const [recurringExpenseModalOpen, openRecurringExpenseModal, closeRecurringExpenseModal] = useModal(false);

    return {
        loginModal: { isOpen: loginModalOpen, open: openLoginModal, close: closeLoginModal },
        signUpModal: { isOpen: signUpModalOpen, open: openSignUpModal, close: closeSignUpModal },
        addCategoryModal: { isOpen: addCategoryModalOpen, open: openAddCategoryModal, close: closeAddCategoryModal },
        confirmDialog: { isOpen: confirmDialogOpen, open: openConfirmDialog, close: closeConfirmDialog },
        addEntryModal: { isOpen: addEntryModalOpen, open: openAddEntryModal, close: closeAddEntryModal },
        budgetGraphsModal: { isOpen: budgetGraphsModalOpen, open: openBudgetGraphsModal, close: closeBudgetGraphsModal },
        monthSelectorModal: { isOpen: monthSelectorOpen, open: openMonthSelector, close: closeMonthSelector },
        editCategoryModal: { isOpen: editCategoryModalOpen, open: openEditCategoryModal, close: closeEditCategoryModal },
        recurringExpenseModal: { isOpen: recurringExpenseModalOpen, open: openRecurringExpenseModal, close: closeRecurringExpenseModal },
    };
}
