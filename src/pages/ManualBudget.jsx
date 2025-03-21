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
import {
  Box,
  Button,
  CssBaseline,
  TextField,
  Typography,
  Container,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useState } from 'react';
import { alpha } from '@mui/material/styles';
import AppAppBar from '../components/AppAppBar';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import GoogleIcon from '@mui/icons-material/Google';

function useTitle(title) {
  React.useEffect(() => {
    const prevTitle = document.title
    document.title = title
    return () => {
      document.title = prevTitle
    }
  })
}

export default function ManualBudget({ setMode, mode, app }) {
  useTitle('theJunkyard: Manual Budget');
  const defaultTheme = createTheme({ palette: { mode } });
  const auth = getAuth(app);
  const [selectedOption, setSelectedOption] = useState('');

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <AppAppBar mode={mode} toggleColorMode={setMode} app={app} />
      <Box
            sx={(theme) => ({
              width: '100%',
              backgroundImage:
                theme.palette.mode === 'light'
                  ? 'linear-gradient(180deg, #CEE5FD, #FFF)'
                  : `linear-gradient(#02294F, ${alpha('#090E10', 0.0)})`,
              backgroundSize: '100% 20%',
              backgroundRepeat: 'no-repeat',
            })}
          >
            <Container maxWidth="lg" sx={{ pt: 12 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="budget-select-label">Budget Options</InputLabel>
                  <Select
                    labelId="budget-select-label"
                    id="budget-select"
                    value={selectedOption}
                    label="Budget Options"
                    onChange={handleChange}
                  >
                    <MenuItem value="option1">Option 1</MenuItem>
                    <MenuItem value="option2">Option 2</MenuItem>
                    <MenuItem value="option3">Option 3</MenuItem>
                    <MenuItem value="option4">Option 4</MenuItem>
                  </Select>
                </FormControl>
            </Container>
      </Box>
    </ThemeProvider>
  );
}
