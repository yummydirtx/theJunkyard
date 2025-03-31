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
import CssBaseline from '@mui/material/CssBaseline';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppAppBar from '../components/AppAppBar';
import Footer from '../components/Footer';
import { Container } from '@mui/material';
import { CalcTitle, CalcForm, ResultsDisplay } from '../components/CalcBasic';
import { useTitle } from '../components/useTitle';

export default function CalcBasic({ setMode, mode, app }) {
  useTitle('theJunkyard: calcBasic');
  const [lowest, setLowest] = React.useState(0);
  const [numberOfLowest, setNumberOfLowest] = React.useState(0);
  const defaultTheme = createTheme({ palette: { mode } });
  const [plural, setPlural] = React.useState('s');

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
          backgroundSize: '100% 20%',
          backgroundRepeat: 'no-repeat',
        })}
      >
        <Box sx={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
          pt: { xs: 12, sm: 15 },
          px: { xs: 2 },
          useFlexGap: true,
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={3} sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}>
              <CalcTitle />
              
              <CalcForm 
                setLowest={setLowest}
                setNumberOfLowest={setNumberOfLowest}
                setPlural={setPlural}
              />
              
              <ResultsDisplay 
                lowest={lowest}
                numberOfLowest={numberOfLowest}
                plural={plural}
              />
            </Grid>
          </Container>
        </Box>
      </Box>
      <Footer />
    </ThemeProvider>
  );
}
