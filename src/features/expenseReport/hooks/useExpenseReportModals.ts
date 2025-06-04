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

import { useState } from 'react';
import useModal from '../../../hooks/useModal';
import { UseExpenseReportModalsReturn, Expense } from '../types';

export default function useExpenseReportModals(): UseExpenseReportModalsReturn {
    const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
    const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);

    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

    const openEditExpenseModal = (expense: Expense): void => {
        if (expense && expense.status === 'pending') {
            setExpenseToEdit(expense);
            setEditModalOpen(true);
        } else {
            console.warn("Cannot edit expenses that are not pending or expense is undefined.");
        }
    };

    const closeEditExpenseModal = (): void => {
        setEditModalOpen(false);
        setExpenseToEdit(null); // Reset expenseToEdit when closing
    };

    // Explicitly define function signatures to match expected return types
    const loginOpen = (): void => openLoginModal();
    const loginClose = (): void => closeLoginModal();
    const signUpOpen = (): void => openSignUpModal();
    const signUpClose = (): void => closeSignUpModal();
    
    return {
        loginModal: { isOpen: loginModalOpen, open: loginOpen, close: loginClose },
        signUpModal: { isOpen: signUpModalOpen, open: signUpOpen, close: signUpClose },
        editExpenseModal: {
            isOpen: editModalOpen,
            open: openEditExpenseModal,
            close: closeEditExpenseModal,
            expenseToEdit,
        }
    };
}
