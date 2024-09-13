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
