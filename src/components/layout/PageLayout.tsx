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

import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { alpha, SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppAppBar from './AppAppBar';
import Footer from './Footer';
import ToggleColorMode from '../ui/ToggleColorMode';

/**
 * Props for the PageLayout component.
 */
interface PageLayoutProps {
    /** The content to render within the layout. */
    children: React.ReactNode;
    /** The current color mode. */
    mode: 'light' | 'dark';
    /** Function to set/toggle the color mode. */
    setMode: (mode: 'light' | 'dark') => void;
    /** Additional styles to apply to the main content area. */
    sx?: SxProps<Theme>;
}

/**
 * PageLayout component provides the main layout structure for the application.
 * It includes the app bar, main content area with theming, and footer.
 */
export default function PageLayout({ children, mode, setMode, sx }: PageLayoutProps) {
  const defaultTheme = createTheme({ palette: { mode } });

  const toggleColorMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <AppAppBar mode={mode} toggleColorMode={toggleColorMode} />
      <Box
        sx={{
          width: '100%',
          backgroundImage:
            defaultTheme.palette.mode === 'light'
              ? 'linear-gradient(180deg, #CEE5FD, #FFF)'
              : `linear-gradient(#02294F, ${alpha('#090E10', 0.0)})`,
          backgroundSize: '100% 125px',
          backgroundRepeat: 'no-repeat',
          ...sx, // Allow for additional sx props
        }}
      >
        {children}
      </Box>
      <Footer />
    </ThemeProvider>
  );
}
