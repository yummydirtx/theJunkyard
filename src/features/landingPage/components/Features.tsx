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
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// Import icons for the new features
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import KeyIcon from '@mui/icons-material/Key'; // Added icon for Keystone
import AnteaterFindLogo from '../../../assets/anteaterfind.png';
import ManualBudgetLogo from '../../../assets/manualbudget.png';
import KeystoneScreenshot from '../../../assets/keystoness.png';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { FeatureItem } from '../types/index';

const items: FeatureItem[] = [
  {
    icon: <KeyIcon />, // Use KeyIcon for Keystone
    title: 'Keystone',
    demoLink: 'https://gokeystone.org', // Link to the Keystone website
    description:
      'A full-stack application designed to solve the difficulty of tracking shared expenses and managing reimbursements for small organizations. Built with React Native, Next.js, Node.js, and PostgreSQL, featuring secure JWT authentication, Google Cloud Vertex AI for automatic receipt parsing (95% accuracy), and a unified UI component library deployed to both web and iOS platforms with 40+ registered users.', // Updated description based on resume
    imageLight: 'url(' + KeystoneScreenshot + ')',
  },
  {
    icon: <SearchIcon />,
    title: 'AnteaterFind',
    demoLink: 'https://anteaterfind.com', // Link to the AnteaterFind demo
    githubLink: 'https://github.com/yummydirtx/AnteaterFind',
    description:
      'AnteaterFind is a full stack web application and search engine, written using Python and React. It was written from the ground up, and is capable of handling over fifty thousand web pages, with a query response time under 300ms.',
    imageLight: ('url(' + AnteaterFindLogo + ')'),
  },
  {
    icon: <AccountBalanceWalletIcon />,
    title: 'Manual Budget',
    demoLink: './manualbudget', // Link to the Manual Budget page
    githubLink: 'https://github.com/yummydirtx/theJunkyard',
    description:
      'Manual Budget is a personal finance tracking tool built with React and Firebase (Firestore). It allows users to meticulously manage monthly budgets by category, record individual spending entries, and visualize financial data through interactive charts powered by Recharts.', // Updated description
    imageLight: 'url(' + ManualBudgetLogo + ')', // Use Manual Budget image
  },
];

const Features: React.FC = () => {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState<number>(0);

  const handleItemClick = (index: number): void => {
    setSelectedItemIndex(index);
  };

  // Ensure selectedFeature exists before accessing its properties
  const selectedFeature = items[selectedItemIndex] || items[0]; // Fallback to first item

  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 12 } }}>
      <Grid container spacing={6} direction={{ xs: 'column', sm: 'row' }}>
        <Grid sx={{ width: { xs: '100%', md: '45%' } }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              component="h2"
              variant="h3"
              color="text.primary"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
                    : 'linear-gradient(90deg, #90caf9 0%, #42a5f5 100%)',
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
                mb: { xs: 2, sm: 4 },
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              A collection of projects showcasing my work. Click to explore each one.
            </Typography>
          </Box>
          <Grid container gap={1.5} sx={{ display: { xs: 'auto', sm: 'none' }, mb: 3 }}>
            {items.map(({ title }, index) => (
              <Chip
                key={index}
                label={title}
                onClick={() => handleItemClick(index)}
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  px: 1,
                  py: 2.5,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: selectedItemIndex === index ? 'primary.main' : 'grey.300',
                  backgroundColor: selectedItemIndex === index ? 'primary.main' : 'background.paper',
                  color: selectedItemIndex === index ? '#fff' : 'text.primary',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: selectedItemIndex === index ? 3 : 0,
                  transform: selectedItemIndex === index ? 'translateY(-2px)' : 'none',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    borderColor: 'primary.main',
                  },
                  '& .MuiChip-label': {
                    color: selectedItemIndex === index ? '#fff' : 'text.primary',
                  },
                }}
              />
            ))}
          </Grid>
          <Box
            component={Card}
            variant="outlined"
            sx={{
              display: { xs: 'auto', sm: 'none' },
              mt: 4,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: 3,
              transition: 'all 0.4s ease-in-out',
            }}
          >
            <Box
              sx={{
                backgroundImage: selectedFeature.imageLight,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                aspectRatio: '16 / 10',
                minHeight: 200,
                bgcolor: (theme) =>
                  theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                transition: 'all 0.4s ease-in-out',
              }}
            />
            <Box sx={{ px: 3, py: 3 }}>
              <Typography
                color="text.primary"
                variant="h6"
                fontWeight="bold"
                sx={{ mb: 1.5 }}
              >
                {selectedFeature.title}
              </Typography>
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{
                  my: 1.5,
                  lineHeight: 1.7,
                }}
              >
                {selectedFeature.description}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {selectedFeature.githubLink && (
                  <Link
                    color="primary"
                    variant="body2"
                    fontWeight="600"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      '& > svg': {
                        transition: 'transform 0.2s ease',
                      },
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                      '&:hover > svg': {
                        transform: 'translateX(2px)',
                      },
                    }}
                    onClick={(event: React.MouseEvent) => {
                      window.open(selectedFeature.githubLink, '_blank');
                      event.stopPropagation();
                    }}
                  >
                    <GitHubIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <span>View Source</span>
                  </Link>
                )}
                {selectedFeature.demoLink && (
                  <Link
                    color="primary"
                    variant="body2"
                    fontWeight="600"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      '& > svg': {
                        transition: 'transform 0.2s ease',
                      },
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                      '&:hover > svg': {
                        transform: 'translateX(2px)',
                      },
                    }}
                    onClick={(event: React.MouseEvent) => {
                      // Use relative path for internal links
                      window.open(selectedFeature.demoLink, '_self');
                      event.stopPropagation();
                    }}
                  >
                    <PlayArrowIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <span>Try it out</span>
                  </Link>
                )}
              </Stack>
            </Box>
          </Box>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={2}
            useFlexGap
            sx={{ width: '100%', display: { xs: 'none', sm: 'flex' } }}
          >
            {items.map(({ icon, title, description, githubLink, demoLink }, index) => ( // Destructure links
              <Card
                key={index}
                variant="outlined"
                component={Button}
                onClick={() => handleItemClick(index)}
                sx={{
                  p: 3.5,
                  height: 'fit-content',
                  width: '100%',
                  background: 'none',
                  borderRadius: 3,
                  border: '2px solid',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: (theme) =>
                    selectedItemIndex === index
                      ? theme.palette.mode === 'light'
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'rgba(144, 202, 249, 0.08)'
                      : 'background.paper',
                  borderColor: (theme) => {
                    if (theme.palette.mode === 'light') {
                      return selectedItemIndex === index
                        ? 'primary.main'
                        : 'grey.300';
                    }
                    return selectedItemIndex === index ? 'primary.main' : 'grey.700';
                  },
                  boxShadow: selectedItemIndex === index ? 4 : 0,
                  transform: selectedItemIndex === index ? 'translateX(8px)' : 'none',
                  '&:hover': {
                    transform: 'translateX(8px)',
                    boxShadow: 3,
                    borderColor: 'primary.main',
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'rgba(25, 118, 210, 0.04)'
                        : 'rgba(144, 202, 249, 0.04)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    textAlign: 'left',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { md: 'center' },
                    gap: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      bgcolor: (theme) =>
                        selectedItemIndex === index
                          ? theme.palette.mode === 'light'
                            ? 'primary.main'
                            : 'primary.dark'
                          : theme.palette.mode === 'light'
                          ? 'grey.100'
                          : 'grey.800',
                      color: (theme) => {
                        if (selectedItemIndex === index) {
                          return '#fff';
                        }
                        return theme.palette.mode === 'light'
                          ? 'grey.600'
                          : 'grey.400';
                      },
                      '& > svg': {
                        fontSize: '1.75rem',
                      },
                    }}
                  >
                    {icon}
                  </Box>
                  <Box sx={{ textTransform: 'none', flex: 1 }}>
                    <Typography
                      color="text.primary"
                      variant="h6"
                      fontWeight="700"
                      sx={{ mb: 1.5, fontSize: '1.1rem' }}
                    >
                      {title}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{
                        my: 1,
                        lineHeight: 1.7,
                        fontSize: '0.9rem',
                      }}
                    >
                      {description}
                    </Typography>
                    <Stack direction="row" spacing={2.5} sx={{ mt: 2 }}>
                      {githubLink && ( // Use destructured variable
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
                            '& > svg': {
                              transition: 'transform 0.2s ease',
                            },
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                            '&:hover > svg': {
                              transform: 'translateX(2px)',
                            },
                          }}
                          onClick={(event: React.MouseEvent) => {
                            window.open(githubLink, '_blank');
                            event.stopPropagation();
                          }}
                        >
                          <GitHubIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <span>View Source</span>
                        </Link>
                      )}
                      {demoLink && (
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
                            '& > svg': {
                              transition: 'transform 0.2s ease',
                            },
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                            '&:hover > svg': {
                              transform: 'translateX(2px)',
                            },
                          }}
                          onClick={(event: React.MouseEvent) => {
                             // Use relative path for internal links
                            window.open(demoLink, '_self');
                            event.stopPropagation();
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
        </Grid>
        <Grid sx={{ display: { xs: 'none', sm: 'flex' }, width: { xs: '100%', md: '50%' }, alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: '90%',
              perspective: '1000px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Card
              variant="outlined"
              sx={{
                width: '100%',
                display: { xs: 'none', sm: 'flex' },
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
        </Grid>
      </Grid>
    </Container>
  );
};

export default Features;
