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
import { alpha } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import KeyIcon from '@mui/icons-material/Key';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AnteaterFindLogo from '../../../assets/anteaterfind.png';
import ManualBudgetLogo from '../../../assets/manualbudget.png';
import KeystoneScreenshot from '../../../assets/keystoness.png';
import { FeatureItem } from '../types/index';

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
            mb: 6,
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

        {/* Desktop Layout: Side by Side */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'grid' },
            gridTemplateColumns: '45% 55%',
            gap: 6,
            alignItems: 'center',
          }}
        >
          {/* Left: Project Cards */}
          <Stack spacing={2}>
            {items.map((item, index) => (
              <Card
                key={index}
                component={Button}
                onClick={() => setSelectedItemIndex(index)}
                sx={{
                  p: 3,
                  textAlign: 'left',
                  background: (theme) =>
                    selectedItemIndex === index
                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(
                          theme.palette.secondary.main,
                          0.1
                        )} 100%)`
                      : alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(20px)',
                  border: '2px solid',
                  borderColor: (theme) =>
                    selectedItemIndex === index
                      ? theme.palette.primary.main
                      : alpha(theme.palette.divider, 0.1),
                  borderRadius: 3,
                  boxShadow: selectedItemIndex === index ? 4 : 0,
                  transform: selectedItemIndex === index ? 'translateX(8px)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateX(8px)',
                    boxShadow: 3,
                    borderColor: 'primary.main',
                    background: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'rgba(25, 118, 210, 0.04)'
                        : 'rgba(144, 202, 249, 0.04)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 48,
                      height: 48,
                      borderRadius: 2,
                      background: (theme) =>
                        selectedItemIndex === index
                          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                          : theme.palette.mode === 'light'
                          ? 'grey.100'
                          : 'grey.800',
                      color: selectedItemIndex === index ? '#fff' : 'grey.600',
                      transition: 'all 0.3s ease',
                      '& > svg': {
                        fontSize: '1.5rem',
                      },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box sx={{ flex: 1, textTransform: 'none' }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 0.75 }}>
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1.5, lineHeight: 1.6 }}
                    >
                      {item.description}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      {item.githubLink && (
                        <Link
                          color="primary"
                          variant="body2"
                          fontWeight="600"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.githubLink, '_blank');
                          }}
                        >
                          <GitHubIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <span>View Source</span>
                        </Link>
                      )}
                      {item.demoLink && (
                        <Link
                          color="primary"
                          variant="body2"
                          fontWeight="600"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.demoLink, '_self');
                          }}
                        >
                          <PlayArrowIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <span>Try it out</span>
                        </Link>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>

          {/* Right: 3D Browser Window */}
          <Box
            sx={{
              perspective: '1000px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Card
              sx={{
                width: '100%',
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
                animation: {
                  xs: 'swivelSubtle 10s ease-in-out infinite',
                  lg: 'swivel 8s ease-in-out infinite',
                },
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease',
                '&:hover': {
                  transform: {
                    xs: 'perspective(1000px) rotateY(-3deg) rotateX(1deg) scale(1.02)',
                    lg: 'rotateY(-2deg) rotateX(1deg) scale(1.03) translateY(-5px)',
                  },
                  boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4)',
                  animation: 'none',
                },
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
        </Box>

        {/* Mobile/Tablet Layout: Tabs + 3D Browser */}
        <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
          {/* Tab Chips */}
          <Box
            sx={{
              mb: 4,
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 1, sm: 1.5 },
              flexWrap: 'nowrap',
              overflowX: 'auto',
              px: { xs: 1, sm: 0 },
              py: 1,
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
            }}
          >
            {items.map((item, index) => (
              <Chip
                key={index}
                icon={item.icon}
                label={item.title}
                onClick={() => setSelectedItemIndex(index)}
                sx={{
                  px: { xs: 0.5, sm: 1.5 },
                  py: { xs: 2, sm: 2.5 },
                  fontSize: { xs: '0.75rem', sm: '0.9rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: (theme) =>
                    selectedItemIndex === index
                      ? theme.palette.primary.main
                      : 'grey.300',
                  backgroundColor: (theme) =>
                    selectedItemIndex === index
                      ? theme.palette.primary.main
                      : 'background.paper',
                  color: selectedItemIndex === index ? '#fff' : 'text.primary',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: selectedItemIndex === index ? 3 : 0,
                  transform: selectedItemIndex === index ? 'translateY(-2px)' : 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    borderColor: 'primary.main',
                  },
                  '& .MuiChip-label': {
                    color: selectedItemIndex === index ? '#fff' : 'text.primary',
                    px: { xs: 0.25, sm: 1 },
                    pl: { xs: 0.5, sm: 1 },
                  },
                  '& .MuiChip-icon': {
                    color: selectedItemIndex === index ? '#fff' : 'inherit',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    ml: { xs: 0.5, sm: 1 },
                    mr: { xs: 0.25, sm: 0.5 },
                  },
                }}
              />
            ))}
          </Box>

          {/* 3D Browser Window for Mobile */}
          <Box
            sx={{
              perspective: '1000px',
              mb: 3,
            }}
          >
            <Card
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'light' ? 'grey.200' : 'grey.800',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                transformStyle: 'preserve-3d',
                animation: 'swivelSubtle 10s ease-in-out infinite',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease',
                '&:hover': {
                  transform: 'perspective(1000px) rotateY(-3deg) rotateX(1deg) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  animation: 'none',
                },
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
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#27c93f' }} />
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    mx: 1.5,
                    px: 1.5,
                    py: 0.4,
                    borderRadius: 1,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light' ? 'white' : 'grey.900',
                    fontSize: '0.7rem',
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

          {/* Selected Project Details */}
          <Card
            sx={{
              p: 3,
              background: (theme) => alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.divider, 0.1),
              borderRadius: 3,
            }}
          >
            <Typography variant="h5" fontWeight="700" sx={{ mb: 1.5 }}>
              {selectedFeature.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, lineHeight: 1.7 }}
            >
              {selectedFeature.description}
            </Typography>
            <Stack direction="row" spacing={2}>
              {selectedFeature.githubLink && (
                <Button
                  size="small"
                  startIcon={<GitHubIcon />}
                  onClick={() => window.open(selectedFeature.githubLink, '_blank')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Source
                </Button>
              )}
              {selectedFeature.demoLink && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => window.open(selectedFeature.demoLink, '_self')}
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
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default EnhancedFeatures;
