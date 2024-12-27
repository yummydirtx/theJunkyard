// Copyright (c) 2024 Alex Frutkin
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
import { alpha } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ProfilePic from '../assets/profilepic.jpeg';
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
          backgroundSize: '100% 40%',
          backgroundRepeat: 'no-repeat',
        })}
      >
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            pt: { xs: 12, sm: 15 },
            pb: { xs: 8, sm: 8 },
          }}
        >
          <Typography
            variant='h2'
            sx={{
              display: {xs: 'flex', sm: 'none'},
              flexDirection: { xs: 'column', md: 'row' },
              alignSelf: 'left',
              textAlign: 'left',
              fontSize: {xs: 'clamp(3.5rem, 10vw, 4rem)', sm: 'clamp(3.5rem, 10vw, 4rem)'},
              fontWeight: 'bold',
              pb: '1rem',
            }}
          >
            Welcome to the Junkyard
          </Typography>
          <Stack direction="row">
          <Stack spacing={2} useFlexGap sx={{ width: { xs: '100%', sm: '100%' } }}>
            <Typography
              variant="h1"
              sx={{
                display: {xs: 'none', sm: 'flex'},
                flexDirection: { xs: 'column', md: 'row' },
                alignSelf: 'left',
                textAlign: 'left',
                fontSize: {xs: 'clamp(3.5rem, 10vw, 4rem)', sm: 'clamp(3.5rem, 10vw, 4rem)'},
                fontWeight: 'bold',
              }}
            >
              Welcome to the Junkyard
            </Typography>
            <Typography
              variant="h2"
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignSelf: 'left',
                textAlign: 'left',
                fontSize: 'clamp(1.9rem, 5vw, 2rem)',
                pt: { xs: 6, sm: 0 },
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
              height: { xs: 85, sm: 120 },
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
    </div>
  );
}
