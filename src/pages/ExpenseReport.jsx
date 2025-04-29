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

import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AppAppBar from '../components/AppAppBar';
import Footer from '../components/Footer';
import { useTitle } from '../components/useTitle';
import { useAuth } from '../contexts/AuthContext';
import LoginPrompt from '../components/ManualBudget/LoginPrompt'; // Re-use LoginPrompt
import useModal from '../hooks/useModal';
import LoginModal from '../components/Authentication/LoginModal';
import SignUpModal from '../components/Authentication/SignUpModal';
import CircularProgress from '@mui/material/CircularProgress';
// Import Firestore functions
import { getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, doc, deleteDoc } from "firebase/firestore"; // Added query, where, onSnapshot, orderBy, doc, deleteDoc
// Import Storage functions for deletion
import { getStorage, ref, deleteObject } from "firebase/storage"; // Added getStorage, ref, deleteObject
// Import new placeholder components
import ExpenseForm from '../components/ExpenseReport/ExpenseForm';
import ExpenseList from '../components/ExpenseReport/ExpenseList';
import ExpenseTotal from '../components/ExpenseReport/ExpenseTotal';

// TODO: Implement Expense Form, Expense List, Receipt Upload, Total Calculation

export default function ExpenseReport({ setMode, mode }) {
    useTitle('theJunkyard: Expense Report');
    const defaultTheme = createTheme({ palette: { mode } });
    const { activeUser, loading: authLoading, app } = useAuth(); // Get app instance from context
    const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
    const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);
    const db = getFirestore(app); // Initialize Firestore
    const storage = getStorage(app); // Initialize Storage

    // State for expenses, fetched from Firestore
    const [expenses, setExpenses] = React.useState([]); // Initialize as empty array
    const [totalAmount, setTotalAmount] = React.useState(0);
    const [loadingExpenses, setLoadingExpenses] = React.useState(false); // State for loading expenses

    // Effect to fetch expenses from Firestore when user is logged in
    React.useEffect(() => {
        if (activeUser && db) {
            setLoadingExpenses(true); // Start loading
            const expensesColRef = collection(db, "users", activeUser.uid, "expenses");
            // Query expenses ordered by creation time
            const q = query(expensesColRef, orderBy("createdAt", "desc"));

            // Use onSnapshot for real-time updates
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedExpenses = [];
                querySnapshot.forEach((doc) => {
                    fetchedExpenses.push({ ...doc.data(), id: doc.id }); // Add document ID to the data
                });
                setExpenses(fetchedExpenses); // Update state with fetched expenses
                setLoadingExpenses(false); // Stop loading
                console.log("Fetched/Updated Expenses:", fetchedExpenses);
            }, (error) => {
                console.error("Error fetching expenses: ", error);
                // TODO: Show error to user
                setLoadingExpenses(false); // Stop loading on error
            });

            // Cleanup function to unsubscribe from the listener when component unmounts or user changes
            return () => unsubscribe();
        } else {
            // Clear expenses if user logs out or db is not available
            setExpenses([]);
        }
    }, [activeUser, db]); // Dependencies: run effect when user or db instance changes

    // Function to add a new expense to Firestore
    const handleAddExpense = async (newExpense) => {
        if (!activeUser || !db) {
            console.error("User not logged in or Firestore not initialized.");
            // TODO: Show error to user in the form component itself
            throw new Error("User not authenticated or database unavailable."); // Throw error to be caught in ExpenseForm
        }
        console.log("Adding expense to Firestore:", newExpense);
        // No need to handle receiptFile upload here, as ExpenseForm passes receiptUri
        const expenseData = {
            userId: activeUser.uid,
            description: newExpense.description,
            amount: newExpense.amount, // Ensure this is a number (already parsed in ExpenseForm)
            receiptUri: newExpense.receiptUri || null, // Store the gs:// URI directly
            items: newExpense.items || null, // Store the items array (or null if empty/not provided)
            createdAt: serverTimestamp(),
        };
        try {
            const docRef = await addDoc(collection(db, "users", activeUser.uid, "expenses"), expenseData);
            console.log("Document written with ID: ", docRef.id);
            // No need to manually update state here, onSnapshot will handle it
        } catch (e) {
            console.error("Error adding document: ", e);
            // TODO: Show error to user in the form component itself
            throw e; // Re-throw error to be caught in ExpenseForm
        }
    };

    // Function to delete an expense from Firestore and its associated receipt from Storage
    const handleDeleteExpense = async (expenseId) => {
        if (!activeUser || !db || !storage) {
            console.error("User not logged in or Firebase services not initialized.");
            // TODO: Show error to user
            return;
        }
        console.log("Deleting expense:", expenseId);

        // Find the expense data locally to get the receiptUri
        const expenseToDelete = expenses.find(exp => exp.id === expenseId);

        // 1. Delete Receipt from Storage (if it exists)
        if (expenseToDelete && expenseToDelete.receiptUri) {
            console.log("Deleting receipt from Storage:", expenseToDelete.receiptUri);
            try {
                const storageRef = ref(storage, expenseToDelete.receiptUri); // Create ref from gs:// URI
                await deleteObject(storageRef);
                console.log("Receipt successfully deleted from Storage!");
            } catch (storageError) {
                // Log error but proceed with Firestore deletion
                // Handle specific errors like 'object-not-found' if needed
                console.error("Error deleting receipt from Storage:", storageError);
                // Optionally inform the user if the file couldn't be deleted but the entry will be
                // TODO: Show specific error based on storageError.code if necessary
            }
        } else {
            console.log("No receipt URI found for this expense, skipping Storage deletion.");
        }

        // 2. Delete Expense Document from Firestore
        try {
            const expenseDocRef = doc(db, "users", activeUser.uid, "expenses", expenseId);
            await deleteDoc(expenseDocRef);
            console.log("Expense document successfully deleted from Firestore!");
            // No need to manually update state here, onSnapshot will handle it
        } catch (firestoreError) {
            console.error("Error deleting expense document from Firestore: ", firestoreError);
            // TODO: Show error to user
        }
    };

    // Effect to calculate total amount whenever expenses state changes
    React.useEffect(() => {
        // Calculate total amount when expenses change
        const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        setTotalAmount(total);
    }, [expenses]); // Dependency: run effect when expenses array changes

    return (
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <AppAppBar mode={mode} toggleColorMode={setMode} />
            <Box
                sx={(theme) => ({
                    width: '100%',
                    backgroundImage:
                        theme.palette.mode === 'light'
                            ? 'linear-gradient(180deg, #CEE5FD, #FFF)'
                            : `linear-gradient(#02294F, ${alpha('#090E10', 0.0)})`,
                    backgroundSize: '100% 10%',
                    backgroundRepeat: 'no-repeat',
                })}
            >
                <Container maxWidth="lg" sx={{ pt: { xs: 12, sm: 15 }, minHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant='h2'
                        sx={{
                            mb: 2,
                            display: { xs: 'flex', sm: 'flex' },
                            flexDirection: { xs: 'column', md: 'row' },
                            alignSelf: 'left',
                            textAlign: 'left',
                            fontSize: { xs: 'clamp(3.4rem, 10vw, 4rem)', sm: 'clamp(3.5rem, 10vw, 4rem)' },
                            fontWeight: 'bold',
                        }}>
                        Expense Report
                    </Typography>

                    {authLoading ? (
                         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                            <CircularProgress />
                        </Box>
                    ) : activeUser ? (
                        <Box sx={{ flexGrow: 1 }}>
                            {/* Pass the handleAddExpense function */}
                            <ExpenseForm onAddExpense={handleAddExpense} />

                            {/* Display loading indicator or the list */}
                            {loadingExpenses ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                /* Pass the fetched expenses and delete handler */
                                <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
                            )}

                            {/* Pass the calculated total amount */}
                            <ExpenseTotal totalAmount={totalAmount} />
                            {/* TODO: Add button/logic to generate reimbursement link */}
                        </Box>
                    ) : (
                        <LoginPrompt
                            openLoginModal={openLoginModal}
                            openSignUpModal={openSignUpModal}
                            loading={authLoading}
                            user={activeUser}
                        />
                    )}
                </Container>
                <Footer />
            </Box>

            {/* Login/Signup Modals */}
            <LoginModal
                open={loginModalOpen}
                onClose={closeLoginModal}
            />
            <SignUpModal
                open={signUpModalOpen}
                onClose={closeSignUpModal}
            />
        </ThemeProvider>
    );
}
