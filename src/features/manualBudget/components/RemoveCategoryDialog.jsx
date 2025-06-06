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
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';

/**
 * RemoveCategoryDialog is a confirmation dialog for deleting a budget category.
 * It handles the deletion of the category and its associated data from Firestore,
 * and updates the overall month totals.
 * @param {object} props - The component's props.
 * @param {boolean} props.open - Controls the visibility of the dialog.
 * @param {function} props.onClose - Callback function to close the dialog.
 * @param {string} props.categoryName - The name of the category to be removed.
 * @param {object} props.db - Firestore database instance.
 * @param {object} props.user - The authenticated user object.
 * @param {string} props.currentMonth - The current budget month (YYYY-MM).
 * @param {function} props.onCategoryRemoved - Callback function invoked after successful category removal.
 */
export default function RemoveCategoryDialog({
    open,
    onClose,
    categoryName,
    db,
    user,
    currentMonth,
    onCategoryRemoved
}) {
    /**
     * Handles the confirmation of category removal.
     * It deletes the category document and updates the month's total goal and spent amounts in Firestore.
     * @async
     */
    const confirmRemoveCategory = async () => {
        if (!categoryName || !user) return;

        try {
            // Get the category data to get its goal and total
            const categoryPath = `manualBudget/${user.uid}/months/${currentMonth}/categories/${categoryName}`;
            const categoryDoc = await getDoc(doc(db, categoryPath));

            if (categoryDoc.exists()) {
                const categoryData = categoryDoc.data();
                const categoryGoal = categoryData.goal || 0;
                const categoryTotal = categoryData.total || 0;

                // Delete the category
                await deleteDoc(doc(db, categoryPath));

                // Update the month's total goal and total spent
                const monthPath = `manualBudget/${user.uid}/months/${currentMonth}`;
                const monthDoc = await getDoc(doc(db, monthPath));

                if (monthDoc.exists()) {
                    const monthData = monthDoc.data();
                    const updatedGoal = Math.max(0, (monthData.goal || 0) - categoryGoal);
                    const updatedTotal = Math.max(0, (monthData.total || 0) - categoryTotal);

                    await setDoc(doc(db, monthPath), {
                        goal: updatedGoal,
                        total: updatedTotal
                    }, { merge: true });
                }

                // Notify parent component
                onCategoryRemoved(categoryName);
            }
        } catch (error) {
            console.error('Error removing category:', error);
        } finally {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Delete Category?"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete the "{categoryName}" category?
                    This will permanently remove this category, its spending goal, and all recorded expenses.
                    This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={confirmRemoveCategory} color="error" autoFocus>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
