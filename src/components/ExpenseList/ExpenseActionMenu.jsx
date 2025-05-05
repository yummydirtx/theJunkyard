import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Renders the action menu for an expense list item.
 * @param {object} props
 * @param {HTMLElement} props.anchorEl - The anchor element for the menu.
 * @param {string|null} props.menuExpenseId - The ID of the expense the menu is for.
 * @param {Array<object>} props.expenses - The full list of expenses (to find the current one).
 * @param {function} props.onClose - Function to close the menu.
 * @param {function} props.onViewItems - Function to trigger viewing items.
 * @param {function} props.onEdit - Function to trigger editing the expense.
 * @param {function} props.onDelete - Function to trigger deleting the expense.
 * @param {boolean} props.canEdit - Whether the edit action should be available.
 * @param {boolean} props.canDelete - Whether the delete action should be available.
 */
export default function ExpenseActionMenu({
    anchorEl,
    menuExpenseId,
    expenses,
    onClose,
    onViewItems,
    onEdit,
    onDelete,
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
            MenuListProps={{
                'aria-labelledby': 'actions-button',
            }}
        >
            {menuItems.length > 0 ? menuItems : <MenuItem disabled>No actions available</MenuItem>}
        </Menu>
    );
}
