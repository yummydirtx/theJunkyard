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
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import ReplayIcon from '@mui/icons-material/Replay';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Expense, ExpenseItem } from '../../types';

interface ExpenseActionMenuProps {
  anchorEl: HTMLElement | null;
  menuExpenseId: string | null;
  expenses: Expense[];
  onClose: () => void;
  onExited?: () => void;
  onViewItems: (items: ExpenseItem[]) => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expenseId: string) => void;
  onUpdateStatus?: (expenseId: string, newStatus: 'pending' | 'denied' | 'reimbursed' | 'approved') => void;
  canEdit: boolean;
  canDelete: boolean;
}

interface MenuAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

// Helper function to create status change actions
const createStatusActions = (
  currentStatus: string,
  onStatusChange: (status: 'pending' | 'denied' | 'reimbursed' | 'approved') => void
): MenuAction[] => {
  const actions: MenuAction[] = [];

  if (currentStatus === 'pending') {
    actions.push({
      key: 'reimburse',
      label: 'Mark as Reimbursed',
      icon: <CheckCircleOutlineIcon sx={{ mr: 1, color: 'success.main' }} fontSize="small" />,
      onClick: () => onStatusChange('reimbursed')
    });
    actions.push({
      key: 'deny',
      label: 'Mark as Denied', 
      icon: <CancelOutlinedIcon sx={{ mr: 1, color: 'warning.main' }} fontSize="small" />,
      onClick: () => onStatusChange('denied')
    });
  } else if (currentStatus === 'reimbursed' || currentStatus === 'denied') {
    actions.push({
      key: 'pending',
      label: 'Mark as Pending',
      icon: <ReplayIcon sx={{ mr: 1 }} fontSize="small" />,
      onClick: () => onStatusChange('pending')
    });
  }

  return actions;
};

// Helper function to get all available actions for an expense
const getAvailableActions = (
  expense: Expense | undefined,
  handlers: {
    onViewItems: (items: ExpenseItem[]) => void;
    onEdit?: (expense: Expense) => void;
    onDelete?: (expenseId: string) => void;
    onUpdateStatus?: (expenseId: string, newStatus: 'pending' | 'denied' | 'reimbursed' | 'approved') => void;
  },
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  }
): MenuAction[] => {
  if (!expense) return [];

  const actions: MenuAction[] = [];
  const hasItems = expense.items && expense.items.length > 0;

  // View items action
  if (hasItems) {
    actions.push({
      key: 'view-items',
      label: 'View Items',
      icon: <InfoIcon sx={{ mr: 1 }} fontSize="small" />,
      onClick: () => handlers.onViewItems(expense.items!)
    });
  }

  // Edit action (only for pending expenses)
  if (permissions.canEdit && expense.status === 'pending' && handlers.onEdit) {
    actions.push({
      key: 'edit',
      label: 'Edit',
      icon: <EditIcon sx={{ mr: 1 }} fontSize="small" />,
      onClick: () => handlers.onEdit!(expense)
    });
  }

  // Status change actions
  if (handlers.onUpdateStatus) {
    const statusActions = createStatusActions(
      expense.status,
      (newStatus) => handlers.onUpdateStatus!(expense.id, newStatus)
    );
    actions.push(...statusActions);
  }

  // Delete action
  if (permissions.canDelete && handlers.onDelete) {
    actions.push({
      key: 'delete',
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1 }} fontSize="small" />,
      onClick: () => handlers.onDelete!(expense.id),
      color: 'error.main'
    });
  }

  return actions;
};

/**
 * Refactored ExpenseActionMenu component with improved separation of concerns
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
}: ExpenseActionMenuProps) {
  const currentExpense = expenses.find(exp => exp.id === menuExpenseId);

  const handleAction = (actionFn: () => void) => {
    actionFn();
    onClose();
  };

  const availableActions = getAvailableActions(
    currentExpense,
    {
      onViewItems: (items) => handleAction(() => onViewItems(items)),
      onEdit: onEdit ? (expense) => handleAction(() => onEdit(expense)) : undefined,
      onDelete: onDelete ? (expenseId) => handleAction(() => onDelete(expenseId)) : undefined,
      onUpdateStatus: onUpdateStatus ? (expenseId, status) => handleAction(() => onUpdateStatus(expenseId, status)) : undefined
    },
    { canEdit, canDelete }
  );

  return (
    <Menu
      id={`actions-menu-${menuExpenseId}`}
      anchorEl={anchorEl}
      open={Boolean(anchorEl && menuExpenseId)}
      onClose={onClose}
      slotProps={{
        transition: {
          onExited: onExited,
        },
        list: {
          'aria-labelledby': 'actions-button',
        }
      }}
    >
      {availableActions.length > 0 ? (
        availableActions.map((action) => (
          <MenuItem 
            key={action.key} 
            onClick={action.onClick}
            sx={action.color ? { color: action.color } : undefined}
          >
            {action.icon} {action.label}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>No actions available</MenuItem>
      )}
    </Menu>
  );
}
