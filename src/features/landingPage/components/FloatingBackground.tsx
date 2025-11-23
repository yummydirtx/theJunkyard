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
import { alpha, keyframes } from '@mui/material';
import Box from '@mui/material/Box';

const float1 = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
`;

const float2 = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  50% { transform: translate(-40px, -40px) rotate(180deg) scale(1.1); }
`;

const float3 = keyframes`
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(25px, 25px); }
  50% { transform: translate(-25px, 25px); }
  75% { transform: translate(-25px, -25px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
`;

const FloatingBackground: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Large gradient orb - top left */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: { xs: '300px', md: '600px' },
          height: { xs: '300px', md: '600px' },
          borderRadius: '50%',
          background: (theme) =>
            `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(
              theme.palette.primary.main,
              0
            )} 70%)`,
          filter: 'blur(60px)',
          animation: `${float1} 20s ease-in-out infinite`,
        }}
      />

      {/* Medium gradient orb - top right */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '-10%',
          width: { xs: '250px', md: '500px' },
          height: { xs: '250px', md: '500px' },
          borderRadius: '50%',
          background: (theme) =>
            `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.12)} 0%, ${alpha(
              theme.palette.secondary.main,
              0
            )} 70%)`,
          filter: 'blur(50px)',
          animation: `${float2} 25s ease-in-out infinite`,
        }}
      />

      {/* Small gradient orb - bottom left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          left: '10%',
          width: { xs: '200px', md: '400px' },
          height: { xs: '200px', md: '400px' },
          borderRadius: '50%',
          background: (theme) =>
            `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
              theme.palette.primary.main,
              0
            )} 70%)`,
          filter: 'blur(40px)',
          animation: `${float3} 18s ease-in-out infinite`,
        }}
      />

      {/* Geometric shapes */}
      {/* Triangle */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '15%',
          width: 0,
          height: 0,
          borderLeft: { xs: '50px solid transparent', md: '80px solid transparent' },
          borderRight: { xs: '50px solid transparent', md: '80px solid transparent' },
          borderBottom: (theme) =>
            `${
              { xs: '70px', md: '120px' }[
                Object.keys({ xs: '70px', md: '120px' })[0]
              ]
            } solid ${alpha(theme.palette.primary.main, 0.05)}`,
          animation: `${pulse} 4s ease-in-out infinite`,
          transform: 'rotate(30deg)',
        }}
      />

      {/* Square */}
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '20%',
          width: { xs: '60px', md: '100px' },
          height: { xs: '60px', md: '100px' },
          background: (theme) => alpha(theme.palette.secondary.main, 0.04),
          backdropFilter: 'blur(5px)',
          borderRadius: '12px',
          animation: `${float1} 15s ease-in-out infinite`,
          transform: 'rotate(15deg)',
        }}
      />

      {/* Circle */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          width: { xs: '40px', md: '70px' },
          height: { xs: '40px', md: '70px' },
          borderRadius: '50%',
          background: (theme) => alpha(theme.palette.primary.main, 0.06),
          animation: `${float2} 12s ease-in-out infinite`,
        }}
      />

      {/* Hexagon-like shape */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          right: '40%',
          width: { xs: '50px', md: '80px' },
          height: { xs: '50px', md: '80px' },
          background: (theme) => alpha(theme.palette.secondary.main, 0.05),
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          animation: `${float3} 20s ease-in-out infinite`,
        }}
      />

      {/* Small dots scattered */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: { xs: '4px', md: '6px' },
            height: { xs: '4px', md: '6px' },
            borderRadius: '50%',
            background: (theme) => alpha(theme.palette.primary.main, 0.15),
            top: `${10 + i * 11}%`,
            left: `${5 + i * 10}%`,
            animation: `${pulse} ${3 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </Box>
  );
};

export default FloatingBackground;
