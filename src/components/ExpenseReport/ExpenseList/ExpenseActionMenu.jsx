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

import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReplayIcon from '@mui/icons-material/Replay';

/**
 * Renders the action menu for an expense list item.
 * @param {object} props
 * @param {HTMLElement} props.anchorEl - The anchor element for the menu.
 * @param {string|null} props.menuExpenseId - The ID of the expense the menu is for.
 * @param {Array<object>} props.expenses - The full list of expenses (to find the current one).
 * @param {function} props.onClose - Function to close the menu.
 * @param {function} props.onExited - Function called after the menu exit transition finishes. // New prop description
 * @param {function} props.onViewItems - Function to trigger viewing items.
 * @param {function} props.onEdit - Function to trigger editing the expense.
 * @param {function} props.onDelete - Function to trigger deleting the expense.
 * @param {function} props.onUpdateStatus - Function to trigger updating the expense status. Receives (expenseId, newStatus).
 * @param {boolean} props.canEdit - Whether the edit action should be available.
 * @param {boolean} props.canDelete - Whether the delete action should be available.
 */
export default function ExpenseActionMenu({
    anchorEl,
    menuExpenseId,
    expenses,
    onClose,
    onExited,
    onViewItems,
    onEdit,
    onDelete,
    onUpdateStatus,
    canEdit,
    canDelete
}) {
    const currentExpense = expenses.find(exp => exp.id === menuExpenseId);
    const hasItems = currentExpense?.items && currentExpense.items.length > 0;

    const handleViewItems = () => {
        if (currentExpense) {
            onViewItems(currentExpense.items);
        }
        onClose();
    };

    const handleEdit = () => {
        if (currentExpense) {
            onEdit(currentExpense);
        }
        onClose();
    };

    const handleDelete = () => {
        if (currentExpense) {
            onDelete(currentExpense.id);
        }
        onClose();
    };

    const handleStatusChange = (newStatus) => {
        if (currentExpense && onUpdateStatus) {
            onUpdateStatus(currentExpense.id, newStatus);
        }
        onClose();
    };

    const menuItems = [];
    if (hasItems) {
        menuItems.push(
            <MenuItem key="view-items" onClick={handleViewItems}>
                <InfoIcon sx={{ mr: 1 }} fontSize="small" /> View Items
            </MenuItem>
        );
    }
    if (canEdit && currentExpense?.status === 'pending') {
        menuItems.push(
            <MenuItem key="edit" onClick={handleEdit}>
                <EditIcon sx={{ mr: 1 }} fontSize="small" /> Edit
            </MenuItem>
        );
    }

    // --- Status Change Options ---
    if (onUpdateStatus && currentExpense) {
        if (currentExpense.status === 'pending') {
            menuItems.push(
                <MenuItem key="reimburse" onClick={() => handleStatusChange('reimbursed')}>
                    <CheckCircleOutlineIcon sx={{ mr: 1, color: 'success.main' }} fontSize="small" /> Mark as Reimbursed
                </MenuItem>
            );
            menuItems.push(
                <MenuItem key="deny" onClick={() => handleStatusChange('denied')}>
                    <CancelOutlinedIcon sx={{ mr: 1, color: 'warning.main' }} fontSize="small" /> Mark as Denied
                </MenuItem>
            );
        } else if (currentExpense.status === 'reimbursed' || currentExpense.status === 'denied') {
            menuItems.push(
                <MenuItem key="pending" onClick={() => handleStatusChange('pending')}>
                    <ReplayIcon sx={{ mr: 1 }} fontSize="small" /> Mark as Pending
                </MenuItem>
            );
        }
    }
    // --- End Status Change Options ---

    if (canDelete) {
        menuItems.push(
            <MenuItem key="delete" onClick={handleDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon sx={{ mr: 1 }} fontSize="small" /> Delete
            </MenuItem>
        );
    }

    return (
        <Menu
            id={`actions-menu-${menuExpenseId}`}
            anchorEl={anchorEl}
            open={Boolean(anchorEl && menuExpenseId)}
            onClose={onClose}
            slotProps={{
                transition: {
                    onExited: onExited, // Call the handler when the transition finishes
                },
                list: {
                    'aria-labelledby': 'actions-button',
                }
            }}
        >
            {menuItems.length > 0 ? menuItems : <MenuItem disabled>No actions available</MenuItem>}
        </Menu>
    );
}
