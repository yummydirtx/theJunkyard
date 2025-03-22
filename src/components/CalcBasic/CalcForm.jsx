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
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import { FormControl, InputLabel, InputAdornment, Input } from '@mui/material';
import { calcBasic } from './hooks';

function CalcForm({ setLowest, setNumberOfLowest, setPlural }) {
  const [oddsValue, setOddsValue] = React.useState('');
  const [oddsValid, setOddsValid] = React.useState(false);
  const [iterationsValue, setIterationsValue] = React.useState('');
  const [iterationsValid, setIterationsValid] = React.useState(false);

  function validateOdds(value) {
    if (value < 1) {
      setOddsValid(false);
    } else {
      setOddsValid(true);
    }
  }

  function validateIterations(value) {
    if (value < 1) {
      setIterationsValid(false);
    } else {
      setIterationsValid(true);
    }
  }

  const handleCalculate = () => {
    if (!oddsValid || !iterationsValid) {
      return;
    }
    let calc = calcBasic(oddsValue, iterationsValue);
    setLowest(calc[0]);
    setNumberOfLowest(calc[1]);
    if (calc[1] === 1) {
      setPlural('');
    } else {
      setPlural('s');
    }
  };

  return (
    <>
      <Grid size={{ xs: 6, sm: 4 }}>
        <FormControl sx={{ width: '100%' }}>
          <InputLabel htmlFor="odds">Odds</InputLabel>
          <Input
            id="odds"
            error={!oddsValid && oddsValue !== ''}
            type="number"
            value={oddsValue}
            onChange={event => { 
              setOddsValue(event.target.value);
              validateOdds(event.target.value);
            }}
            startAdornment={<InputAdornment position='start'>1 in</InputAdornment>} />
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <FormControl sx={{ width: '100%' }}>
          <InputLabel htmlFor="iterations">Iterations</InputLabel>
          <Input
            error={!iterationsValid && iterationsValue !== ''}
            id="iterations"
            value={iterationsValue}
            onChange={event => { 
              setIterationsValue(event.target.value);
              validateIterations(event.target.value);
            }}
            type="number" />
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleCalculate}
          sx={{ width: '100%' }}
        >
          Calculate
        </Button>
      </Grid>
    </>
  );
}

CalcForm.propTypes = {
  setLowest: PropTypes.func.isRequired,
  setNumberOfLowest: PropTypes.func.isRequired,
  setPlural: PropTypes.func.isRequired,
};

export default CalcForm;
