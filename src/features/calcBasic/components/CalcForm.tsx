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
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { FormControl, InputLabel, InputAdornment, Input } from '@mui/material';
import { calcBasic } from '../hooks/hooks';

/**
 * Props interface for the CalcForm component
 */
interface CalcFormProps {
  /** Function to set the lowest number of tickets */
  setLowest: (lowest: number) => void;
  /** Function to set the count of times the lowest occurred */
  setNumberOfLowest: (count: number) => void;
  /** Function to set plural suffix for display */
  setPlural: (plural: string) => void;
}

/**
 * CalcForm component provides input fields for odds and iterations,
 * and a calculate button to run the lottery simulation.
 */
const CalcForm: React.FC<CalcFormProps> = ({ setLowest, setNumberOfLowest, setPlural }) => {
  const [oddsValue, setOddsValue] = React.useState<string>('');
  const [oddsValid, setOddsValid] = React.useState<boolean>(false);
  const [iterationsValue, setIterationsValue] = React.useState<string>('');
  const [iterationsValid, setIterationsValid] = React.useState<boolean>(false);

  const validateOdds = (value: string): void => {
    const numValue = parseFloat(value);
    if (numValue < 1) {
      setOddsValid(false);
    } else {
      setOddsValid(true);
    }
  };

  const validateIterations = (value: string): void => {
    const numValue = parseFloat(value);
    if (numValue < 1) {
      setIterationsValid(false);
    } else {
      setIterationsValid(true);
    }
  };

  const handleCalculate = (): void => {
    if (!oddsValid || !iterationsValid) {
      return;
    }
    const calc = calcBasic(parseFloat(oddsValue), parseInt(iterationsValue));
    setLowest(calc[0]);
    setNumberOfLowest(calc[1]);
    if (calc[1] === 1) {
      setPlural('');
    } else {
      setPlural('s');
    }
  };

  const handleOddsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setOddsValue(value);
    validateOdds(value);
  };

  const handleIterationsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setIterationsValue(value);
    validateIterations(value);
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
            onChange={handleOddsChange}
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
            onChange={handleIterationsChange}
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
};

export default CalcForm;
