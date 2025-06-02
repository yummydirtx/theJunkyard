// /Users/alexfrutkin/Documents/Code/theJunkyard/src/features/expenseReport/hooks/useExpenseReportModals.js
import { useState } from 'react';
import useModal from '../../../hooks/useModal';

export default function useExpenseReportModals() {
    const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
    const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState(null);

    const openEditExpenseModal = (expense) => {
        if (expense && expense.status === 'pending') {
            setExpenseToEdit(expense);
            setEditModalOpen(true);
        } else {
            console.warn("Cannot edit expenses that are not pending or expense is undefined.");
        }
    };

    const closeEditExpenseModal = () => {
        setEditModalOpen(false);
        setExpenseToEdit(null); // Reset expenseToEdit when closing
    };

    return {
        loginModal: { isOpen: loginModalOpen, open: openLoginModal, close: closeLoginModal },
        signUpModal: { isOpen: signUpModalOpen, open: openSignUpModal, close: closeSignUpModal },
        editExpenseModal: {
            isOpen: editModalOpen,
            open: openEditExpenseModal,
            close: closeEditExpenseModal,
            expenseToEdit,
        }
    };
}
