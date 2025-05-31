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
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Container } from '@mui/material';
import PageLayout from '../components/PageLayout'; // Import PageLayout
import { CalcTitle, CalcForm, ResultsDisplay } from '../components/CalcBasic';
import { useTitle } from '../components/useTitle';

/**
 * CalcBasic component provides a basic calculator interface.
 * It allows users to input numbers and operations to perform calculations.
 * This specific version seems to focus on finding the lowest number and its count.
 * @param {object} props - The component's props.
 * @param {function} props.setMode - Function to toggle the color mode (light/dark).
 * @param {string} props.mode - The current color mode ('light' or 'dark').
 * @param {object} props.app - Firebase app instance (currently unused in this component directly).
 */
export default function CalcBasic({ setMode, mode }) {
  useTitle('theJunkyard: calcBasic');
  /** @state {number} lowest - Stores the lowest number found from the input. */
  const [lowest, setLowest] = React.useState(0);
  /** @state {number} numberOfLowest - Stores the count of occurrences of the lowest number. */
  const [numberOfLowest, setNumberOfLowest] = React.useState(0);
  /** @state {string} plural - Determines if the word "time" should be pluralized in the results display. */
  const [plural, setPlural] = React.useState('s');

  return (
    <PageLayout mode={mode} setMode={setMode}>
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
    </PageLayout>
  );
}
