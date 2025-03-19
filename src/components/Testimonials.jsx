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
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/system';
import DiscordIcon from '../assets/discord-mark-blue.svg';
import logo from '../assets/websitelogo.png';

const userTestimonials = [
  {
    avatar: <Avatar alt="Ayush Lenka" src="/static/images/avatar/1.jpg" />,
    name: 'Ayush Lenka',
    occupation: 'Programming Master',
    testimonial:
      "CS major approval right here from yours truly.",
  },
  {
    avatar: <Avatar alt="Matthew Cohen" src="/static/images/avatar/2.jpg" />,
    name: 'Matthew Cohen',
    occupation: 'Bartender',
    testimonial:
      "Very revolutionary. I love the simplicity.",
  },
  {
    avatar: <Avatar alt="Sam Frutkin" src="/static/images/avatar/3.jpg" />,
    name: 'Sam Frutkin',
    occupation: 'Discord Mod',
    testimonial:
      'You\'re clearly cool and talented.',
  },
  {
    avatar: <Avatar alt="Amanda Riordan" src="/static/images/avatar/4.jpg" />,
    name: 'Amanda Riordan',
    occupation: 'Minecraft Expert',
    testimonial:
      "those could all be testimonials if you were devoted enough",
  },
  {
    avatar: <Avatar alt="Mika Schreiman" src="/static/images/avatar/5.jpg" />,
    name: 'Mika Schreiman',
    occupation: 'Aquatics Coordinator',
    testimonial:
      "I can't give testimony on products I've never used!",
  },
  {
    avatar: <Avatar alt="Alex Frutkin" src="/static/images/avatar/6.jpg" />,
    name: 'Alex Frutkin',
    occupation: 'CEO and Founder of theJunkyard',
    testimonial:
      "Does anyone actually read these?",
  },
];

const whiteLogos = [
  'https://em-content.zobj.net/source/apple/155/basket_1f9fa.png',
  'https://aepi.org/wp-content/uploads/2018/06/AEPi_Greek-1024x576.png',
  DiscordIcon,
  'https://em-content.zobj.net/source/apple/155/basket_1f9fa.png',
  'https://upload.wikimedia.org/wikipedia/en/0/0e/University_of_California%2C_Irvine_seal.svg',
  logo,
];

const darkLogos = [
  'https://em-content.zobj.net/source/apple/155/basket_1f9fa.png',
  'https://aepi.org/wp-content/uploads/2018/06/AEPi_Greek-1024x576.png',
  DiscordIcon,
  'https://em-content.zobj.net/source/apple/155/basket_1f9fa.png',
  'https://upload.wikimedia.org/wikipedia/en/0/0e/University_of_California%2C_Irvine_seal.svg',
  logo,
];

const logoStyle = {
  height: '25px',
  opacity: 0.3,
};

export default function Testimonials() {
  const theme = useTheme();
  const logos = theme.palette.mode === 'light' ? darkLogos : whiteLogos;

  return (
    <Container
      id="testimonials"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
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
        <Typography component="h2" variant="h4" color="text.primary">
          Testimonials
        </Typography>
        <Typography variant="body1" color="text.secondary">
          See what people are saying about the Junkyard and its projects.
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {userTestimonials.map((testimonial, index) => (
          <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex' }}>
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flexGrow: 1,
                p: 1,
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {testimonial.testimonial}
                </Typography>
              </CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  pr: 1,
                }}
              >
                <CardHeader
                  avatar={testimonial.avatar}
                  title={testimonial.name}
                  subheader={testimonial.occupation}
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
