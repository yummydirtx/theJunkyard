import * as React from 'react';
import { alpha } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ProfilePic from '../assets/profilepic.jpeg';
import PastWebsites from './PastWebsites';
import Divider from '@mui/material/Divider';

export default function Me() {
  return (
    <div>
      <Box
        id="me"
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
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            pt: { xs: 12, sm: 15 },
            pb: { xs: 8, sm: 12 },
          }}
        >
          <Stack direction="row">
          <Stack spacing={2} useFlexGap sx={{ width: { xs: '100%', sm: '100%' } }}>
            <Typography
              variant="h1"
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignSelf: 'left',
                textAlign: 'left',
                fontSize: 'clamp(3.5rem, 10vw, 4rem)',
              }}
            >
              About Me
            </Typography>
            <Typography
              variant="h2"
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignSelf: 'left',
                textAlign: 'left',
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
              }}
            >
              Hi, I'm Alex Frutkin.
            </Typography>
          </Stack>
          <Box
            component="img"
            id="profilepic"
            sx={(theme) => ({
              mt: { xs: 0, sm: 0 },
              alignSelf: 'right',
              height: { xs: 75, sm: 120 },
              width: 'auto',
              borderRadius: '999px',
              outline: '1px solid',
              outlineColor:
                theme.palette.mode === 'light'
                  ? alpha('#BFCCD9', 0.5)
                  : alpha('#9CCCFC', 0.1),
              boxShadow:
                theme.palette.mode === 'light'
                  ? `0 0 12px 8px ${alpha('#9CCCFC', 0.2)}`
                  : `0 0 24px 12px ${alpha('#033363', 0.2)}`,
            })}
            src = {ProfilePic}
          />
          </Stack>
          <Typography
              textAlign="left"
              color="text.secondary"
              sx={{ mt:{ xs: 1, sm: 1 }, alignSelf: 'left', width: { sm: '100%', md: '80%' } }}
            >
              I'm a student at the University of California, Irvine studying Software Engineering. I'm passionate about software development, and I'm always looking for new opportunities to learn and grow. I'm currently seeking internships for Summer 2025.
            </Typography>
        </Container>
      </Box>
      <Divider />
      <PastWebsites />
    </div>
  );
}
