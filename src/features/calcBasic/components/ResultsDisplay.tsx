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
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';

/**
 * Props interface for the ResultsDisplay component
 */
interface ResultsDisplayProps {
  /** The lowest number of tickets bought to win */
  lowest: number;
  /** The number of times the lowest occurred */
  numberOfLowest: number;
  /** Plural suffix for display ('s' or '') */
  plural: string;
}

/**
 * ResultsDisplay component shows the results of the lottery simulation.
 * It displays either a welcome message or the calculation results.
 */
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ lowest, numberOfLowest, plural }) => {
  if (lowest === 0) {
    return (
      <Grid size={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="body1">
          Welcome to calcBasic.
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid size={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="body1">
        The lowest number of tickets bought to win was {lowest}, which happened {numberOfLowest} time{plural}.
      </Typography>
    </Grid>
  );
};

export default ResultsDisplay;
