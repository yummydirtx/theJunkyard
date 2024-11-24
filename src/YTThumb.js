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
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AppAppBar from './components/AppAppBar';
import Grid from '@mui/material/Grid2';
import { Typography, FormControl, InputLabel, InputAdornment, Input } from '@mui/material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Footer from './components/Footer';

function useTitle(title) {
  React.useEffect(() => {
    const prevTitle = document.title
    document.title = title
    return () => {
      document.title = prevTitle
    }
  })
}

function ToggleCustomTheme({ showCustomTheme, toggleCustomTheme }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100dvw',
        position: 'fixed',
        bottom: 24,
      }}
    >
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={showCustomTheme}
        onChange={toggleCustomTheme}
        aria-label="Platform"
        sx={{
          backgroundColor: 'background.default',
          '& .Mui-selected': {
            pointerEvents: 'none',
          },
        }}
      >
        <ToggleButton value>
          <AutoAwesomeRoundedIcon sx={{ fontSize: '20px', mr: 1 }} />
          Custom theme
        </ToggleButton>
        <ToggleButton value={false}>Material Design 2</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

ToggleCustomTheme.propTypes = {
  showCustomTheme: PropTypes.shape({
    valueOf: PropTypes.func.isRequired,
  }).isRequired,
  toggleCustomTheme: PropTypes.func.isRequired,
};

export default function YTThumb({ setMode, mode }) {
  useTitle('theJunkyard: YTThumb');
  const defaultTheme = createTheme({ palette: { mode } });

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
        <Grid container spacing={3} sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: {xs: '100%', sm: '75%'},
        }}>
            <Grid size={12}>
                <Typography component="h1" variant="h3">
                    calcBasic-web
                </Typography>
                <Typography variant="body1" >
                    Ever wanted to win your own lottery? Using calcBasic, now you can. Enter the odds of winning, and calcBasic will automatically buy unlimited tickets until you win. It will then repeat this process a number of times you specify, and tell you the lowest number of tickets you bought to win, and how many times that happened. The prize is a sense of pride and accomplishment. Good luck!
                </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
                <FormControl sx={{width: '100%'}}>
                    <InputLabel htmlFor="odds">Odds</InputLabel>
                    <Input
                    id="odds" 
                    type="number"
                    startAdornment={<InputAdornment position='start'>1 in</InputAdornment>} />
                </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
                <FormControl sx={{width: '100%'}}>
                    <InputLabel htmlFor="iterations">Iterations</InputLabel>
                    <Input 
                    id="iterations" 
                    type="number" />
                </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <Button variant="contained" color="primary"
                sx={{
                    width: '100%',
                }}>Calculate</Button>
            </Grid>
            <Grid size={12} sx={() => {
                if (1 === 0) {
                    return {display: 'none'};
                } else {
                    return {display: 'flex', flexDirection: 'column', alignItems: 'center'};
                }
            }}>
                <Typography variant="body1" >
                    The lowest number of tickets bought to win was , which happened 
                </Typography>
            </Grid>
            <Grid size={12} sx={() => {
                if (1 != 0) {
                    return {display: 'none'};
                } else {
                    return {display: 'flex', flexDirection: 'column', alignItems: 'center'};
                }
            }}>
                <Typography variant="body1" >
                    Welcome to calcBasic.
                </Typography>
            </Grid>
        </Grid>
      </Box>
    </Box>
      <Divider sx={{pt: { sm: 8 }, display: {xs: 'none', sm: 'inherit'}}}/>
      <Footer />
    </ThemeProvider>
  );
}
