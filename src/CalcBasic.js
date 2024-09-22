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

import CssBaseline from '@mui/material/CssBaseline';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AppAppBar from './components/AppAppBar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import { Typography, FormControl, InputLabel, InputAdornment, Input } from '@mui/material';

function getRandomTriesGeometric(p) {
  // Generate a uniform random number between 0 and 1
  let U = Math.random();
  // Use the inverse CDF of the geometric distribution to get the number of tries
  return Math.ceil(Math.log(U) / p);
}

function calcBasic(odds, iterations) {
    let lowestTries = Number.MAX_VALUE;
    let numberOfLowest = 0;
    let p = Math.log(1 - (1 / odds));
    for (let i = 0; i < iterations; i++) {
        let tries = getRandomTriesGeometric(p);
        if (tries < lowestTries) {
            lowestTries = tries;
            numberOfLowest = 1;
        } else if (tries === lowestTries) {
            numberOfLowest++;
        }
    }
    return [ lowestTries, numberOfLowest ];
}

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

export default function CalcBasic({ setMode, mode }) {
  useTitle('theJunkyard: calcBasic');
  const [lowest, setLowest] = React.useState(0);
  const [numberOfLowest, setNumberOfLowest] = React.useState(0);
  const defaultTheme = createTheme({ palette: { mode } });
  const [oddsValue, setOddsValue] = React.useState('');
  const [oddsValid, setOddsValid] = React.useState(false);
  const [iterationsValue, setIterationsValue] = React.useState('');
  const [iterationsValid, setIterationsValid] = React.useState(false);
  const [plural, setPlural] = React.useState('s');

  function validateOdds( value ) {
    if (value < 1) {
        setOddsValid(false);
    } else {
        setOddsValid(true);
    }
  }

  function validateIterations( value ) {
    if (value < 1) {
        setIterationsValid(false);
    } else {
        setIterationsValid(true);
    }
  }

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
                    error={!oddsValid && oddsValue !== ''}
                    type="number"
                    onChange={event => {setOddsValue(event.target.value), validateOdds(event.target.value)}} 
                    startAdornment={<InputAdornment position='start'>1 in</InputAdornment>} />
                </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
                <FormControl sx={{width: '100%'}}>
                    <InputLabel htmlFor="iterations">Iterations</InputLabel>
                    <Input 
                    error={!iterationsValid && iterationsValue !== ''}
                    id="iterations" 
                    onChange={event => {setIterationsValue(event.target.value), validateIterations(event.target.value)}}
                    type="number" />
                </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <Button variant="contained" color="primary"
                onClick={() => {
                    if (!oddsValid || !iterationsValid) {
                        return;
                    }
                    let calc = calcBasic(document.getElementById('odds').value, document.getElementById('iterations').value);
                    setLowest(calc[0]);
                    setNumberOfLowest(calc[1]);
                    if (calc[1] === 1) {
                        setPlural('');
                    } else {
                        setPlural('s');
                    }
                }}
                sx={{
                    width: '100%',
                }}>Calculate</Button>
            </Grid>
            <Grid size={12} sx={() => {
                if (lowest === 0) {
                    return {display: 'none'};
                } else {
                    return {display: 'flex', flexDirection: 'column', alignItems: 'center'};
                }
            }}>
                <Typography variant="body1" >
                    The lowest number of tickets bought to win was {lowest}, which happened {numberOfLowest} time{plural}.
                </Typography>
            </Grid>
            <Grid size={12} sx={() => {
                if (lowest != 0) {
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
