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

import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

interface Browser3DProps {
  title: string;
  imageUrl: string;
  variant?: 'desktop' | 'mobile';
}

const Browser3D: React.FC<Browser3DProps> = ({ title, imageUrl, variant = 'desktop' }) => {
  const [rotation, setRotation] = useState({ x: 3, y: -8 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const rotationRef = useRef(rotation);

  // Keep rotation ref in sync
  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow touch/pen input, not mouse (desktop)
    if (e.pointerType === 'mouse') return;
    
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    e.preventDefault();
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Update rotation based on drag
    const sensitivity = 0.3;
    setRotation({
      x: Math.max(-7.5, Math.min(7.5, rotationRef.current.x - deltaY * sensitivity)),
      y: Math.max(-15, Math.min(5, rotationRef.current.y + deltaX * sensitivity)),
    });

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragStartRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragStartRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const baseTransform = `perspective(1000px) rotateY(${rotation.y}deg) rotateX(${rotation.x}deg)`;

  return (
    <Box
      sx={{
        perspective: '1000px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        ...(variant === 'mobile' && { mb: 3 }),
      }}
    >
      <Card
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: variant === 'desktop' ? 4 : 3,
          overflow: 'hidden',
          border: '2px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'light' ? 'grey.200' : 'grey.800',
          boxShadow: isDragging 
            ? '0 30px 80px rgba(0, 0, 0, 0.4)' 
            : variant === 'desktop' 
            ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
            : '0 10px 30px rgba(0, 0, 0, 0.2)',
          transformStyle: 'preserve-3d',
          transform: baseTransform,
          transition: isDragging 
            ? 'box-shadow 0.2s ease' 
            : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease',
          cursor: isDragging ? 'grabbing' : variant === 'mobile' ? 'grab' : 'default',
          touchAction: 'none',
          userSelect: 'none',
          pointerEvents: 'auto',
          // Desktop-only animation
          ...(variant === 'desktop' && !isDragging && {
            animation: 'swivel 8s ease-in-out infinite',
            '@keyframes swivel': {
              '0%, 100%': {
                transform: 'perspective(1000px) rotateY(-10deg) rotateX(3deg) translateY(-5px)',
              },
              '25%': {
                transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg) translateY(0px)',
              },
              '50%': {
                transform: 'perspective(1000px) rotateY(-10deg) rotateX(4deg) translateY(-8px)',
              },
              '75%': {
                transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg) translateY(0px)',
              },
            },
          }),
          // Mobile-only animation
          ...(variant === 'mobile' && !isDragging && {
            animation: 'swivelSubtle 10s ease-in-out infinite',
            '@keyframes swivelSubtle': {
              '0%, 100%': {
                transform: 'perspective(1000px) rotateY(-6deg) rotateX(3deg) translateY(-2px)',
              },
              '25%': {
                transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg) translateY(0px)',
              },
              '50%': {
                transform: 'perspective(1000px) rotateY(-6deg) rotateX(3.5deg) translateY(-3px)',
              },
              '75%': {
                transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg) translateY(0px)',
              },
            },
          }),
        }}
      >
        {/* Browser Chrome */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: variant === 'desktop' ? 1.5 : 1.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? 'grey.100' : 'grey.800',
            borderBottom: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'light' ? 'grey.300' : 'grey.700',
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            <Box 
              sx={{ 
                width: variant === 'desktop' ? 12 : 10, 
                height: variant === 'desktop' ? 12 : 10, 
                borderRadius: '50%', 
                bgcolor: '#ff5f56' 
              }} 
            />
            <Box 
              sx={{ 
                width: variant === 'desktop' ? 12 : 10, 
                height: variant === 'desktop' ? 12 : 10, 
                borderRadius: '50%', 
                bgcolor: '#ffbd2e' 
              }} 
            />
            <Box 
              sx={{ 
                width: variant === 'desktop' ? 12 : 10, 
                height: variant === 'desktop' ? 12 : 10, 
                borderRadius: '50%', 
                bgcolor: '#27c93f' 
              }} 
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              mx: variant === 'desktop' ? 2 : 1.5,
              px: variant === 'desktop' ? 2 : 1.5,
              py: variant === 'desktop' ? 0.5 : 0.4,
              borderRadius: 1,
              bgcolor: (theme) =>
                theme.palette.mode === 'light' ? 'white' : 'grey.900',
              fontSize: variant === 'desktop' ? '0.75rem' : '0.7rem',
              color: 'text.secondary',
              textAlign: 'center',
            }}
          >
            {title}
          </Box>
        </Box>
        {/* Website Screenshot */}
        <Box
          sx={{
            width: '100%',
            aspectRatio: '16 / 10',
            backgroundSize: 'cover',
            backgroundImage: imageUrl,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top center',
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
            transition: 'all 0.5s ease-in-out',
          }}
        />
      </Card>
    </Box>
  );
};

export default Browser3D;
