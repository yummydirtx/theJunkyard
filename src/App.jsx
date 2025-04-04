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
import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Lazy load pages instead of direct imports
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CalcBasic = lazy(() => import('./pages/CalcBasic'));
const YTThumb = lazy(() => import('./pages/YTThumb'));
const ManualBudget = lazy(() => import('./pages/ManualBudget'));

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNWHnPGjQlu4Dt-WFJsGej11O9tnP9HuI",
  authDomain: "thejunkyard.dev",
  projectId: "thejunkyard-b1858",
  storageBucket: "thejunkyard-b1858.firebasestorage.app",
  messagingSenderId: "66694016123",
  appId: "1:66694016123:web:1c659a2c06d31c5a7b86de",
  measurementId: "G-HEJ6YMFJY6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default function App() {
  const [mode, setMode] = React.useState(() => {
    // Default to system preference initially
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  React.useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, get their preference from Firestore
        try {
          const userPrefs = await getDoc(doc(db, 'userPreferences', user.uid));
          if (userPrefs.exists() && userPrefs.data().theme) {
            setMode(userPrefs.data().theme);
          } else {
            // If no Firestore preference, use localStorage
            const localMode = localStorage.getItem('mode');
            if (localMode) setMode(localMode);
          }
        } catch (error) {
          console.error("Error fetching theme preference:", error);
        }
      } else {
        // User is signed out, use localStorage
        const localMode = localStorage.getItem('mode');
        if (localMode) setMode(localMode);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleColorMode = () => {
    setMode((prev) => {
      const newMode = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mode', newMode); // Save the new mode to localStorage
      return newMode;
    });
  };

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path='/' element={<LandingPage setMode={toggleColorMode} mode={mode} app={app} />} />
        <Route path='/calcbasic-web' element={<CalcBasic setMode={toggleColorMode} mode={mode} app={app}/>} />
        <Route path='/ytthumb' element={<YTThumb setMode={toggleColorMode} mode={mode} app={app}/>} />
        <Route path='/manualbudget' element={<ManualBudget setMode={toggleColorMode} mode={mode} app={app}/>} />
      </Routes>
    </BrowserRouter>
  );
}
