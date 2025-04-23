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
import { lazy, Suspense } from 'react'; // Import Suspense
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAnalytics } from "firebase/analytics";
// Remove auth imports handled by context
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { getFirestore, doc, getDoc } from "firebase/firestore";
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import CircularProgress from '@mui/material/CircularProgress'; // For Suspense fallback
import Box from '@mui/material/Box'; // For Suspense fallback styling

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNWHnPGjQlu4Dt-WFJsGej11O9tnP9HuI",
  authDomain: "thejunkyard-b1858.firebaseapp.com",
  projectId: "thejunkyard-b1858",
  storageBucket: "thejunkyard-b1858.firebasestorage.app",
  messagingSenderId: "66694016123",
  appId: "1:66694016123:web:1c659a2c06d31c5a7b86de",
  measurementId: "G-HEJ6YMFJY6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider( import.meta.env.VITE_RECAPTCHA_API_KEY ),
  isTokenAutoRefreshEnabled: true // Set to true to automatically refresh the token
});
const analytics = getAnalytics(app);

// Lazy load pages instead of direct imports
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CalcBasic = lazy(() => import('./pages/CalcBasic'));
const YTThumb = lazy(() => import('./pages/YTThumb'));
const ManualBudget = lazy(() => import('./pages/ManualBudget'));

export default function App() {
  const [mode, setMode] = React.useState(() => {
    // Check localStorage first
    const localMode = localStorage.getItem('mode');
    if (localMode) return localMode;
    // Default to system preference if no localStorage value
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Add useEffect to check for grecaptcha object
  React.useEffect(() => {
    // Check after a short delay to allow scripts to load
    const timer = setTimeout(() => {
      if (window.grecaptcha && window.grecaptcha.execute) {
        console.log("reCAPTCHA script (window.grecaptcha) loaded successfully.");
      } else {
        console.error("reCAPTCHA script (window.grecaptcha) FAILED to load or initialize.");
      }
    }, 2000); // Check after 2 seconds

    return () => clearTimeout(timer); // Cleanup timer
  }, []); // Run only once on mount

  const toggleColorMode = () => {
    setMode((prev) => {
      const newMode = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mode', newMode); // Save the new mode to localStorage
      // Theme saving to Firestore is now handled in AppAppBar based on activeUser
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
    // Wrap the entire routing structure with AuthProvider
    <AuthProvider app={app}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        {/* Use Suspense to handle lazy loading */}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Pass mode, toggleColorMode, but remove app prop where context is used */}
            <Route path='/' element={<LandingPage setMode={toggleColorMode} mode={mode} />} />
            <Route path='/calcbasic-web' element={<CalcBasic setMode={toggleColorMode} mode={mode} />} />
            <Route path='/ytthumb' element={<YTThumb setMode={toggleColorMode} mode={mode} />} />
            <Route path='/manualbudget' element={<ManualBudget setMode={toggleColorMode} mode={mode} />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
