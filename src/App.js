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
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import ProTip from './ProTip';
import LandingPage from './LandingPage';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AboutMe from './AboutMe';
import CalcBasic from './CalcBasic';

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
        <Route path='/' element={<LandingPage setMode={toggleColorMode} mode={mode} />} />
        <Route path='/about' element={<AboutMe setMode={toggleColorMode} mode={mode}/>} />
        <Route path='/calcbasic-web' element={<CalcBasic setMode={toggleColorMode} mode={mode}/>} />
      </Routes>
    </BrowserRouter>
  );
}
