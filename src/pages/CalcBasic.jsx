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
import Grid from '@mui/material/Grid2';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppAppBar from '../components/AppAppBar';
import Footer from '../components/Footer';
import { Typography, Container } from '@mui/material';
import { CalcForm, ResultsDisplay } from '../components/CalcBasic';
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
        <Box useFlexGap sx={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
          pt: { xs: 12, sm: 15 },
          px: { xs: 2 },
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={3} sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}>
              <Grid size={12}>
                <Typography variant='h2'
                  sx={{
                    display: { xs: 'flex', sm: 'flex' },
                    flexDirection: { xs: 'column', md: 'row' },
                    alignSelf: 'left',
                    textAlign: 'left',
                    fontSize: { xs: 'clamp(3.4rem, 10vw, 4rem)', sm: 'clamp(3.5rem, 10vw, 4rem)' },
                    fontWeight: 'bold',
                    pb: '0.25rem',
                  }}>
                  calcBasic-web
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Ever wanted to win your own lottery? Using calcBasic, now you can. Enter the odds of winning, and calcBasic will automatically buy unlimited tickets until you win. It will then repeat this process a number of times you specify, and tell you the lowest number of tickets you bought to win, and how many times that happened. The prize is a sense of pride and accomplishment. Good luck!
                </Typography>
              </Grid>
              
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
      <Divider sx={{ pt: { sm: 8 }, display: { xs: 'none', sm: 'inherit' } }} />
      <Footer />
    </ThemeProvider>
  );
}
