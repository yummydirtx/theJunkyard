import * as React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid2';
import { Typography } from '@mui/material';

function ResultsDisplay({ lowest, numberOfLowest, plural }) {
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
}

ResultsDisplay.propTypes = {
  lowest: PropTypes.number.isRequired,
  numberOfLowest: PropTypes.number.isRequired,
  plural: PropTypes.string.isRequired,
};

export default ResultsDisplay;
