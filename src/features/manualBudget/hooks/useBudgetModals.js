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
