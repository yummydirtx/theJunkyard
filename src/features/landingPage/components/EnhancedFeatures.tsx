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
import { alpha, keyframes } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import KeyIcon from '@mui/icons-material/Key';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AnteaterFindLogo from '../../../assets/anteaterfind.png';
import ManualBudgetLogo from '../../../assets/manualbudget.png';
import KeystoneScreenshot from '../../../assets/keystoness.png';
import { FeatureItem } from '../types/index';

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const floatCard = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const items: FeatureItem[] = [
  {
    icon: <KeyIcon />,
    title: 'Keystone',
    demoLink: 'https://gokeystone.org',
    githubLink: 'https://github.com/yummydirtx/keystone',
    description:
      'A full-stack application designed to solve the difficulty of tracking shared expenses and managing reimbursements for small organizations. Built with React Native, Next.js, Node.js, and PostgreSQL, featuring secure JWT authentication, Google Cloud Vertex AI for automatic receipt parsing (95% accuracy), and a unified UI component library deployed to both web and iOS platforms with 40+ registered users.',
    imageLight: 'url(' + KeystoneScreenshot + ')',
  },
  {
    icon: <SearchIcon />,
    title: 'AnteaterFind',
    demoLink: 'https://anteaterfind.com',
    githubLink: 'https://github.com/yummydirtx/AnteaterFind',
    description:
      'AnteaterFind is a full stack web application and search engine, written using Python and React. It was written from the ground up, and is capable of handling over fifty thousand web pages, with a query response time under 300ms.',
    imageLight: 'url(' + AnteaterFindLogo + ')',
  },
  {
    icon: <AccountBalanceWalletIcon />,
    title: 'Manual Budget',
    demoLink: './manualbudget',
    githubLink: 'https://github.com/yummydirtx/theJunkyard',
    description:
      'Manual Budget is a personal finance tracking tool built with React and Firebase (Firestore). It allows users to meticulously manage monthly budgets by category, record individual spending entries, and visualize financial data through interactive charts powered by Recharts.',
    imageLight: 'url(' + ManualBudgetLogo + ')',
  },
];

interface TiltCardProps {
  children: React.ReactNode;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, index, isSelected, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <Box
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      sx={{
        perspective: '1000px',
        width: '100%',
        animation: `${floatCard} ${3 + index * 0.5}s ease-in-out infinite`,
        animationDelay: `${index * 0.2}s`,
      }}
    >
      <Card
        sx={{
          p: 3,
          height: '100%',
          cursor: 'pointer',
          background: (theme) =>
            isSelected
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(
                  theme.palette.secondary.main,
                  0.1
                )} 100%)`
              : alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: (theme) =>
            isSelected
              ? theme.palette.primary.main
              : alpha(theme.palette.divider, 0.1),
          borderRadius: 4,
          boxShadow: isSelected
            ? '0 20px 60px rgba(0, 0, 0, 0.3)'
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${
            isSelected ? 'scale(1.02)' : 'scale(1)'
          }`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 4,
            background: isSelected
              ? `linear-gradient(90deg, 
                  transparent, 
                  ${alpha('#fff', 0.1)}, 
                  transparent
                )`
              : 'none',
            backgroundSize: '200% 100%',
            animation: isSelected ? `${shimmer} 2s infinite` : 'none',
            pointerEvents: 'none',
          },
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateZ(10px)`,
          },
        }}
      >
        {children}
      </Card>
    </Box>
  );
};

const EnhancedFeatures: React.FC = () => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const selectedFeature = items[selectedItemIndex] || items[0];

  return (
    <Box
      ref={sectionRef}
      id="features"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? `linear-gradient(180deg, ${alpha('#fff', 0.9)} 0%, ${alpha('#f5f5f5', 0.9)} 100%)`
            : `linear-gradient(180deg, ${alpha('#0a0a0a', 0.9)} 0%, ${alpha('#1a1a1a', 0.9)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            mb: 8,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              mb: 2,
              background: (theme) =>
                theme.palette.mode === 'light'
                  ? 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)'
                  : 'linear-gradient(45deg, #90caf9 30%, #42a5f5 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Featured Projects
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: '600px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            Explore my latest work showcasing full-stack development, AI integration, and modern web technologies
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          {items.map((item, index) => (
            <TiltCard
              key={index}
              index={index}
              isSelected={selectedItemIndex === index}
              onClick={() => setSelectedItemIndex(index)}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  mb: 2,
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: '#fff',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  transform: 'translateZ(20px)',
                  '& > svg': {
                    fontSize: '1.75rem',
                  },
                }}
              >
                {item.icon}
              </Box>

              <Typography
                variant="h5"
                fontWeight="700"
                sx={{ mb: 1.5, transform: 'translateZ(15px)' }}
              >
                {item.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  lineHeight: 1.7,
                  minHeight: '120px',
                  transform: 'translateZ(10px)',
                }}
              >
                {item.description}
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 'auto', transform: 'translateZ(10px)' }}
              >
                {item.githubLink && (
                  <Button
                    size="small"
                    startIcon={<GitHubIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.githubLink, '_blank');
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Source
                  </Button>
                )}
                {item.demoLink && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.demoLink, '_self');
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    Demo
                  </Button>
                )}
              </Stack>
            </TiltCard>
          ))}
        </Box>

        {/* Featured Project Preview - 3D Browser Window */}
        <Box
          sx={{
            mt: 8,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            perspective: '1000px',
          }}
        >
          <Card
            sx={{
              width: '100%',
              maxWidth: '90%',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'none',
              borderRadius: 4,
              overflow: 'hidden',
              border: '2px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'light' ? 'grey.200' : 'grey.800',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              transformStyle: 'preserve-3d',
              position: 'relative',
              animation: 'swivel 8s ease-in-out infinite, slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: 'rotateY(-8deg) rotateX(3deg)',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease',
              '&:hover': {
                transform: 'rotateY(-2deg) rotateX(1deg) scale(1.03) translateY(-5px)',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4)',
                animation: 'none',
              },
              '@keyframes swivel': {
                '0%, 100%': {
                  transform: 'rotateY(-10deg) rotateX(3deg) translateY(-5px)',
                },
                '25%': {
                  transform: 'rotateY(-4deg) rotateX(2deg) translateY(0px)',
                },
                '50%': {
                  transform: 'rotateY(-10deg) rotateX(4deg) translateY(-8px)',
                },
                '75%': {
                  transform: 'rotateY(-4deg) rotateX(2deg) translateY(0px)',
                },
              },
              '@keyframes slideIn': {
                '0%': {
                  opacity: 0,
                  transform: 'rotateY(-25deg) rotateX(10deg) translateX(100px) translateY(50px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'rotateY(-8deg) rotateX(3deg) translateX(0) translateY(0)',
                },
              },
            }}
          >
            {/* Browser Chrome */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1.5,
                bgcolor: (theme) =>
                  theme.palette.mode === 'light' ? 'grey.100' : 'grey.800',
                borderBottom: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'light' ? 'grey.300' : 'grey.700',
              }}
            >
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  mx: 2,
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'light' ? 'white' : 'grey.900',
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                {selectedFeature.title}
              </Box>
            </Box>
            {/* Project Screenshot */}
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16 / 10',
                backgroundSize: 'cover',
                backgroundImage: selectedFeature.imageLight,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'top center',
                bgcolor: (theme) =>
                  theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                transition: 'all 0.5s ease-in-out',
              }}
            />
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default EnhancedFeatures;
