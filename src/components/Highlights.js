import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import PanoramaIcon from '@mui/icons-material/Panorama';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import MoodIcon from '@mui/icons-material/Mood';

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Predictable performance',
    description:
      'Our products are so basic that the performance probably couldn\'nt be improved. It\'s just that good.',
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Built to last',
    description:
      'So few lines of code were used that it\'s impossible for it to break. It\'s just that good.',
  },
  {
    icon: <PanoramaIcon />,
    title: 'Great user experience',
    description:
      'There truly is no interface quite like the command line interface. It\'s just that good.',
  },
  {
    icon: <MoodIcon />,
    title: 'Innovative functionality',
    description:
      'From our research, we couldn\'t find another product that can perform the same actions that calcBasic can. It\'s just that good.',
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: 'Amazing READMEs',
    description:
      'Thanks to our top notch markdown development team, our READMEs are the best in the business. It\'s just that good.',
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'It\'s just that good',
    description:
      'It\'s just that good.',
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: '#06090a',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4">
            Highlights
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            Explore why our product stands out: adaptability, durability,
            user-friendly design, and innovation. Enjoy reliable customer support and
            precision in every detail.
          </Typography>
        </Box>
        <Grid container spacing={2.5}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Stack
                direction="column"
                color="inherit"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  p: 3,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'grey.800',
                  background: 'transparent',
                  backgroundColor: 'grey.900',
                }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  <Typography fontWeight="medium" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
