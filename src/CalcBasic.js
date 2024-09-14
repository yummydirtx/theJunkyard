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

function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function calcBasic(odds, iterations) {
    // TODO: Use a better algorithm based on statistics rather than brute simulation.
    let lowestTries = Number.MAX_VALUE;
    let numberOfLowest = 0;
    for (let i = 0; i < iterations; i++) {
        let guess = 0;
        let tries = 0;
        while (guess !== 1) {
            guess = getRandomIntInclusive(1, odds);
            tries++;
        }
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

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <AppAppBar mode={mode} toggleColorMode={setMode} />
      <Box
      id="hero"
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
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 3, sm: 6 },
        pt: { xs: 14, sm: 20 },
        pb: { sm: 2 },
        px: { xs: 2, sm: 15 },
        }}>
        <Grid container spacing={2}>
            <Grid size={12}>
                <Typography component="h2" variant="h4">
                    Calculate Basic Odds
                </Typography>
                <Typography variant="body1" >
                    Calculate the odds of guessing a number between 1 and a given number.
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
                onClick={() => {
                    let calc = calcBasic(document.getElementById('odds').value, document.getElementById('iterations').value);
                    setLowest(calc[0]);
                    setNumberOfLowest(calc[1]);
                }}
                sx={{
                    width: '100%',
                }}>Calculate</Button>
            </Grid>
            <Grid size={12}>
                <Typography variant="body1" sx={{textAlign: 'center'}}>
                    The lowest number of tries was {lowest} with {numberOfLowest} occurences.
                </Typography>
            </Grid>
        </Grid>
      </Box>
    </Box>
      <Divider sx={{display: {xs: 'none', sm: 'inherit'}}}/>
      <Footer />
    </ThemeProvider>
  );
}
