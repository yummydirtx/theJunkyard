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

// TODO: Implement Expense Form, Expense List, Receipt Upload, Total Calculation

export default function ExpenseReport({ setMode, mode }) {
    useTitle('theJunkyard: Expense Report');
    const defaultTheme = createTheme({ palette: { mode } });
    const { activeUser, loading: authLoading } = useAuth();
    const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
    const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);

    // Placeholder state
    const [expenses, setExpenses] = React.useState([]);
    const [totalAmount, setTotalAmount] = React.useState(0);

    // TODO: Fetch expenses from Firestore based on activeUser

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
                            {/* TODO: Add Expense Form Component */}
                            <Typography variant="h6" gutterBottom>Add New Expense</Typography>
                            {/* Placeholder for form */}
                            <Box sx={{ p: 2, border: '1px dashed grey', mb: 3 }}>Form Placeholder</Box>

                            {/* TODO: Add Expense List Component */}
                            <Typography variant="h6" gutterBottom>Expense Log</Typography>
                            {/* Placeholder for list */}
                            <Box sx={{ p: 2, border: '1px dashed grey', mb: 3 }}>
                                {expenses.length === 0 ? "No expenses logged yet." : "List Placeholder"}
                            </Box>

                            <Typography variant="h5">Total: ${totalAmount.toFixed(2)}</Typography>
                            {/* TODO: Add Threshold logic/display */}
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
