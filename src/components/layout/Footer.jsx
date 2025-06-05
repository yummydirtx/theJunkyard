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
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Logo from '../../assets/websitelogo.png';
import GithubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const logoStyle = {
  width: '100px',
  height: 'auto',
};

/**
 * Copyright component displays the copyright information.
 */
function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" mt={1}>
      {'Copyright © '}
      Alex Frutkin&nbsp;
      {new Date().getFullYear()}
    </Typography>
  );
}

/**
 * Footer component displays site navigation links, social media icons, and copyright information.
 * It includes a function to scroll to specific sections on the landing page.
 */
export default function Footer() {
  /** @state {boolean} open - State to potentially control a mobile menu or similar, currently unused in the scroll logic directly. */
  const [open, setOpen] = React.useState(false);

  /**
   * Scrolls to a specific section on the page by its ID.
   * If the section is not found, it navigates to the home page.
   * @param {string} sectionId - The ID of the HTML element to scroll to.
   */
  const scrollToSection = (sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    const offset = 128; // Offset to account for fixed headers or other UI elements.
    if (sectionElement) {
      const targetScroll = sectionElement.offsetTop - offset;
      sectionElement.scrollIntoView({ behavior: 'smooth' });
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
      setOpen(false); // Closes a potential mobile menu, though 'open' state is not directly tied to menu visibility here.
    } else {
      window.open("/", "_self") // Fallback to home page if section not found.
    }
  };

  return (
    <>
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 4, sm: 8 },
          pt: { xs: 4, sm: 8 },
          pb: { xs: 8, sm: 10 },
          textAlign: { sm: 'center', md: 'left' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: { xs: 4, sm: 8 },
            width: '100%',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <div>
            <img
              src={
                Logo
              }
              style={logoStyle}
              alt="logo of sitemark"
            />
            <Copyright />
          </div>
          <Stack
            direction="row"
            justifyContent="left"
            spacing={1}
            useFlexGap
            sx={{
              color: 'text.secondary',
            }}
          >
            <IconButton
              color="inherit"
              href="https://github.com/yummydirtx/theJunkyard"
              aria-label="GitHub"
              sx={{ alignSelf: 'center' }}
            >
              <GithubIcon />
            </IconButton>
            <IconButton
              color="inherit"
              href="https://www.linkedin.com/in/alex-frutkin-63804597/"
              aria-label="LinkedIn"
              sx={{ alignSelf: 'center' }}
            >
              <LinkedInIcon />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
