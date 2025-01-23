// Copyright (c) 2024 Alex Frutkin
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
import LandingPage from './LandingPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CalcBasic from './CalcBasic';
import YTThumb from './YTThumb';
import SignUp from './SignUp';
import LogIn from './LogIn';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const analytics = getAnalytics(app);

export default function App() {
  const [mode, setMode] = React.useState(() => {
    // Retrieve the mode from localStorage or default to 'dark'
    let before;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      before = "light";
    } else {
      before = "dark";
    }
    return localStorage.getItem('mode') || before;
  });

  const toggleColorMode = () => {
    setMode((prev) => {
      const newMode = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mode', newMode); // Save the new mode to localStorage
      return newMode;
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage setMode={toggleColorMode} mode={mode} app={app} />} />
        <Route path='/calcbasic-web' element={<CalcBasic setMode={toggleColorMode} mode={mode} app={app}/>} />
        <Route path='/ytthumb' element={<YTThumb setMode={toggleColorMode} mode={mode} app={app}/>} />
        <Route path='/signup' element={<SignUp setMode={toggleColorMode} mode={mode} app={app}/>} />
        <Route path='/login' element={<LogIn setMode={toggleColorMode} mode={mode} app={app}/>} />
      </Routes>
    </BrowserRouter>
  );
}
