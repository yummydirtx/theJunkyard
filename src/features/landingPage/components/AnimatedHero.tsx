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

import React, { useEffect, useState } from 'react';
import { alpha, keyframes } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CodeIcon from '@mui/icons-material/Code';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ProfilePic from '../../../assets/profilepic.jpeg';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const AnimatedHero: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = "Welcome to the Junkyard";
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 80);

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  const skills = [
    { icon: <CodeIcon fontSize="small" />, label: 'Full Stack Dev' },
    { icon: <RocketLaunchIcon fontSize="small" />, label: 'React & TypeScript' },
    { icon: <AutoAwesomeIcon fontSize="small" />, label: 'Cloud & AI' },
  ];

  return (
    <Box
      id="hero"
      sx={{
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        pt: { xs: 8, md: 10 },
        pb: { xs: 4, md: 0 },
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)'
            : 'linear-gradient(-45deg, #1a237e, #4a148c, #0d47a1, #006064)',
        backgroundSize: '400% 400%',
        animation: `${gradientShift} 15s ease infinite`,
      }}
    >
      {/* Floating geometric shapes */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: { xs: 100, md: 200 },
            height: { xs: 100, md: 200 },
            borderRadius: i % 2 === 0 ? '50%' : '20%',
            background: (theme) =>
              alpha(theme.palette.primary.main, 0.1),
            backdropFilter: 'blur(10px)',
            animation: `${float} ${8 + i * 2}s ease-in-out infinite`,
            left: `${i * 20}%`,
            top: `${i * 15}%`,
            opacity: 0.3,
          }}
        />
      ))}

      <Container
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          py: { xs: 8, md: 12 },
        }}
      >
        {/* Profile Picture with Glow */}
        <Box
          sx={{
            animation: `${fadeInUp} 1s ease-out, ${pulse} 3s ease-in-out infinite`,
            animationDelay: '0s',
          }}
        >
          <Box
            component="img"
            src={ProfilePic}
            alt="Alex Frutkin"
            sx={(theme) => ({
              width: { xs: 120, md: 180 },
              height: { xs: 120, md: 180 },
              borderRadius: '50%',
              border: '4px solid',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              boxShadow: `
                0 0 60px ${alpha(theme.palette.primary.main, 0.6)},
                0 0 120px ${alpha(theme.palette.secondary.main, 0.4)},
                0 10px 40px rgba(0, 0, 0, 0.3)
              `,
              objectFit: 'cover',
            })}
          />
        </Box>

        {/* Animated Title */}
        <Box
          sx={{
            animation: `${fadeInUp} 1s ease-out`,
            animationDelay: '0.2s',
            animationFillMode: 'backwards',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
              fontWeight: 900,
              background: 'linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.7) 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
              mb: 1,
              fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            {displayText}
            <Box
              component="span"
              sx={{
                opacity: showCursor ? 1 : 0,
                transition: 'opacity 0.1s',
                color: '#fff',
              }}
            >
              |
            </Box>
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.95)',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              mb: 3,
            }}
          >
            Hi, I'm Alex Frutkin
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              textShadow: '0 1px 5px rgba(0,0,0,0.2)',
            }}
          >
            Software Engineering student at UC Irvine, passionate about building
            innovative solutions and creating exceptional user experiences.
          </Typography>
        </Box>

        {/* Skill Tags */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 2,
            animation: `${fadeInUp} 1s ease-out`,
            animationDelay: '0.4s',
            animationFillMode: 'backwards',
          }}
        >
          {skills.map((skill, index) => (
            <Chip
              key={index}
              icon={skill.icon}
              label={skill.label}
              sx={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', md: '1rem' },
                px: 2,
                py: 2.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '& .MuiChip-icon': {
                  color: '#fff',
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.25)',
                  transform: 'translateY(-4px) scale(1.05)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                },
              }}
            />
          ))}
        </Stack>

        {/* CTA Text */}
        <Typography
          sx={{
            fontSize: { xs: '0.9rem', md: '1rem' },
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            textAlign: 'center',
            animation: `${fadeInUp} 1s ease-out`,
            animationDelay: '0.6s',
            animationFillMode: 'backwards',
            mt: 2,
          }}
        >
          Currently seeking internships for Summer 2026 🚀
        </Typography>
      </Container>
    </Box>
  );
};

export default AnimatedHero;
