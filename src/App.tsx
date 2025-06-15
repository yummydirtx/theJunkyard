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

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import * as React from 'react';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import app from './services/firebase/config';
import { FirebaseApp } from 'firebase/app'; // Import FirebaseApp type

// Define a type for the theme mode
type ThemeMode = 'light' | 'dark';

// Define props for components that receive mode and toggleColorMode
interface ThemeProps {
  mode: ThemeMode;
  setMode: (mode: ThemeMode | ((prevMode: ThemeMode) => ThemeMode)) => void;
}

// Lazy load pages for better initial load performance.
const LandingPage = lazy(() => import('./features/landingPage/pages/LandingPage'));
const CalcBasic = lazy(() => import('./features/calcBasic/pages/CalcBasic'));
const YTThumb = lazy(() => import('./features/ytThumb/pages/YTThumb'));
const ManualBudget = lazy(() => import('./features/manualBudget/pages/ManualBudgetWithQuery'));
const ExpenseReport = lazy(() => import('./features/expenseReport/pages/ExpenseReport'));
const SharedExpenseReport = lazy(() => import('./features/expenseReport/pages/SharedExpenseReport'));

export default function App(): React.ReactElement {
  const [mode, setMode] = React.useState<ThemeMode>(() => {
    // Attempt to retrieve the saved theme mode from localStorage.
    const localMode = localStorage.getItem('mode') as ThemeMode | null;
    if (localMode) return localMode;
    // If no mode is saved in localStorage, default to the user's system preference.
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Create a QueryClient instance
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 1,
      },
    },
  }));

  const toggleColorMode = (): void => {
    setMode((prev: ThemeMode) => {
      const newMode: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      // Persist the newly selected theme mode to localStorage.
      localStorage.setItem('mode', newMode);
      // Note: Saving the theme preference to Firestore for logged-in users
      // is handled within the AppAppBar component, triggered by changes to activeUser.
      return newMode;
    });
  };

  // Suspense fallback component
  const LoadingFallback = (): React.ReactElement => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    // Wrap the entire routing structure with AuthProvider to make auth state available
    <QueryClientProvider client={queryClient}>
      <AuthProvider app={app as FirebaseApp}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          {/* Use Suspense to handle lazy loading of route components */}
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path='/' element={<LandingPage setMode={toggleColorMode as ThemeProps['setMode']} mode={mode} />} />
              <Route path='/calcbasic-web' element={<CalcBasic setMode={toggleColorMode as ThemeProps['setMode']} mode={mode} />} />
              <Route path='/ytthumb' element={<YTThumb setMode={toggleColorMode as ThemeProps['setMode']} mode={mode} app={app as FirebaseApp} />} />
              <Route path='/manualbudget' element={<ManualBudget setMode={toggleColorMode as ThemeProps['setMode']} mode={mode} />} />
              <Route path='/expensereport' element={<ExpenseReport setMode={toggleColorMode as ThemeProps['setMode']} mode={mode} />} />
              <Route path='/share/expense-report/:shareId' element={<SharedExpenseReport mode={mode} setMode={setMode as ThemeProps['setMode']} />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
