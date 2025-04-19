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
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
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

    // Placeholder state - This might move or be managed differently with Firestore
    const [expenses, setExpenses] = React.useState([
        // Example data
        // { id: '1', description: 'Lunch Meeting', amount: 25.50, receiptFile: null },
        // { id: '2', description: 'Office Supplies', amount: 15.75, receiptFile: { name: 'receipt.jpg' } },
    ]);
    const [totalAmount, setTotalAmount] = React.useState(0);

    // TODO: Fetch expenses from Firestore based on activeUser
    // TODO: Implement functions to add/delete expenses (passed to components)
    const handleAddExpense = async (newExpense) => {
        if (!activeUser || !db) {
            console.error("User not logged in or Firestore not initialized.");
            // TODO: Show error to user
            return;
        }
        console.log("Adding expense to Firestore:", newExpense);
        try {
            // TODO: Handle receiptFile upload to Storage first, then get URL
            const expenseData = {
                userId: activeUser.uid,
                description: newExpense.description,
                amount: newExpense.amount, // Ensure this is a number
                receiptFileName: newExpense.receiptFile ? newExpense.receiptFile.name : null, // Store filename for now
                receiptUrl: null, // Placeholder for Storage URL
                createdAt: serverTimestamp(),
            };
            const docRef = await addDoc(collection(db, "users", activeUser.uid, "expenses"), expenseData);
            console.log("Document written with ID: ", docRef.id);
            // TODO: Clear form state (handled in ExpenseForm)
            // TODO: Update local state OR rely on Firestore listener to update the list
            // setExpenses(prev => [...prev, { ...expenseData, id: docRef.id }]); // Example if not using listener
        } catch (e) {
            console.error("Error adding document: ", e);
            // TODO: Show error to user
        }
    };

    const handleDeleteExpense = (expenseId) => {
        console.log("Deleting expense in parent:", expenseId);
        // Placeholder: Update state (in real app, update Firestore)
        // setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    };


    React.useEffect(() => {
        // Calculate total amount when expenses change
        const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        setTotalAmount(total);
    }, [expenses]);

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
                            {/* Use ExpenseForm component */}
                            <ExpenseForm onAddExpense={handleAddExpense} />

                            {/* Use ExpenseList component */}
                            <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />

                            {/* Use ExpenseTotal component */}
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
