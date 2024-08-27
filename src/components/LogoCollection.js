import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/system';
import wm from '../assets/wm.svg';

const whiteLogos = [
  'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
  'https://logosandtypes.com/wp-content/uploads/2022/03/metaverse.svg',
  'https://www.svgrepo.com/show/349582/adobe.svg',
  'https://upload.wikimedia.org/wikipedia/commons/7/75/Netflix_icon.svg',
  'https://upload.wikimedia.org/wikipedia/commons/1/1b/Apple_logo_grey.svg',
  wm,
];

const darkLogos = [
  'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
  'https://logosandtypes.com/wp-content/uploads/2022/03/metaverse.svg',
  'https://www.svgrepo.com/show/349582/adobe.svg',
  'https://upload.wikimedia.org/wikipedia/commons/7/75/Netflix_icon.svg',
  'https://upload.wikimedia.org/wikipedia/commons/1/1b/Apple_logo_grey.svg',
  wm,
];

const logoStyle = {
  width: 'auto',
  height: '80px',
  margin: '0 32px',
  opacity: 0.7,
};

export default function LogoCollection() {
  const theme = useTheme();
  const logos = theme.palette.mode === 'light' ? darkLogos : whiteLogos;

  return (
    <Box id="logoCollection" sx={{ py: 4 }}>
      <Typography
        component="p"
        variant="subtitle2"
        align="center"
        color="text.secondary"
      >
        Companies I wish I had an intenship at
      </Typography>
      <Grid container justifyContent="center" sx={{ mt: 0.5, opacity: 0.6 }}>
        {logos.map((logo, index) => (
          <Grid item key={index}>
            <img
              src={logo}
              alt={`Cool company ${index + 1}`}
              style={logoStyle}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
