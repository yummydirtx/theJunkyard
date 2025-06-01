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
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import * as React from 'react';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNWHnPGjQlu4Dt-WFJsGej11O9tnP9HuI",
  authDomain: "thejunkyard-b1858.firebaseapp.com",
  projectId: "thejunkyard-b1858",
  storageBucket: "thejunkyard-b1858.firebasestorage.app",
  messagingSenderId: "66694016123",
  appId: "1:66694016123:web:1c659a2c06d31c5a7b86de",
  measurementId: "G-HEJ6YMFJY6"
};

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider( import.meta.env.VITE_RECAPTCHA_API_KEY ),
  isTokenAutoRefreshEnabled: true // Enables automatic token refresh for Firebase App Check.
});
const analytics = getAnalytics(app);

// Lazy load pages for better initial load performance.
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CalcBasic = lazy(() => import('./pages/CalcBasic'));
const YTThumb = lazy(() => import('./pages/YTThumb'));
const ManualBudget = lazy(() => import('./pages/ManualBudget'));
const ExpenseReport = lazy(() => import('./pages/ExpenseReport'));
const SharedExpenseReport = lazy(() => import('./pages/SharedExpenseReport'));

export default function App() {
  const [mode, setMode] = React.useState(() => {
    // Attempt to retrieve the saved theme mode from localStorage.
    const localMode = localStorage.getItem('mode');
    if (localMode) return localMode;
    // If no mode is saved in localStorage, default to the user's system preference.
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const toggleColorMode = () => {
    setMode((prev) => {
      const newMode = prev === 'dark' ? 'light' : 'dark';
      // Persist the newly selected theme mode to localStorage.
      localStorage.setItem('mode', newMode);
      // Note: Saving the theme preference to Firestore for logged-in users
      // is handled within the AppAppBar component, triggered by changes to activeUser.
      return newMode;
    });
  };

  // Suspense fallback component
  const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    // Wrap the entire routing structure with AuthProvider to make auth state available
    <AuthProvider app={app}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        {/* Use Suspense to handle lazy loading of route components */}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path='/' element={<LandingPage setMode={toggleColorMode} mode={mode} />} />
            <Route path='/calcbasic-web' element={<CalcBasic setMode={toggleColorMode} mode={mode} />} />
            <Route path='/ytthumb' element={<YTThumb setMode={toggleColorMode} mode={mode} />} />
            <Route path='/manualbudget' element={<ManualBudget setMode={toggleColorMode} mode={mode} />} />
            <Route path='/expensereport' element={<ExpenseReport setMode={toggleColorMode} mode={mode} />} />
            <Route path='/share/expense-report/:shareId' element={<SharedExpenseReport mode={mode} setMode={setMode} />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
