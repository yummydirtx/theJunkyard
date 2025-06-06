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
import { Grid, Typography } from '@mui/material';

/**
 * CalcTitle component displays the title and description for the calcBasic application.
 * It provides information about what the application does and how to use it.
 */
const CalcTitle: React.FC = () => {
    return (
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
    );
};

export default CalcTitle;
