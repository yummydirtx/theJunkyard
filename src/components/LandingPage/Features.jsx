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
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Added icon for Expense Report
import AnteaterFindLogo from '../../assets/anteaterfind.png';
// Assume logos exist for Manual Budget & Expense Report, or replace with generic icons/images
import ManualBudgetLogo from '../../assets/manualbudget.png'; // Placeholder: Make sure this image exists
import ExpenseReportLogo from '../../assets/expensereport.png'; // Placeholder: Make sure this image exists
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const items = [
  {
    icon: <SearchIcon />,
    title: 'AnteaterFind',
    demoLink: 'https://ics.uci.edu/~afrutkin',
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
  {
    icon: <ReceiptLongIcon />, // Use ReceiptLongIcon
    title: 'Expense Report',
    demoLink: './expensereport', // Link to the Expense Report page
    githubLink: 'https://github.com/yummydirtx/theJunkyard',
    description:
      'Expense Report leverages React, Firebase (Firestore, Storage), and Google Cloud Vertex AI to streamline expense tracking. Users can manually input expenses or upload receipt images, which are processed by utilizing Vertex AI\'s generative models to automatically parse details and create itemized lists.', // Updated description
    imageLight: 'url(' + ExpenseReportLogo + ')', // Use Expense Report image
  },
];

export default function Features() {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

  const handleItemClick = (index) => {
    setSelectedItemIndex(index);
  };

  // Ensure selectedFeature exists before accessing its properties
  const selectedFeature = items[selectedItemIndex] || items[0]; // Fallback to first item

  return (
    <Container id="features" sx={{ py: { xs: 4, sm: 4 } }}>
      <Grid container spacing={6} direction={{ xs: 'column', sm: 'row' }}>
        <Grid sx={{ width: { xs: '100%', md: '45%' } }}>
          <div>
            <Typography component="h2" variant="h4" color="text.primary">
              Featured Projects
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: { xs: 2, sm: 4 } }}
            >
              This is a collection of projects I have worked on. Click on each one to learn more.
            </Typography>
          </div>
          <Grid container gap={1} sx={{ display: { xs: 'auto', sm: 'none' } }}>
            {items.map(({ title }, index) => (
              <Chip
                key={index}
                label={title}
                onClick={() => handleItemClick(index)}
                sx={{
                  borderColor: (theme) => {
                    if (theme.palette.mode === 'light') {
                      return selectedItemIndex === index ? 'primary.light' : '';
                    }
                    return selectedItemIndex === index ? 'primary.light' : '';
                  },
                  background: (theme) => {
                    if (theme.palette.mode === 'light') {
                      return selectedItemIndex === index ? 'none' : '';
                    }
                    return selectedItemIndex === index ? 'none' : '';
                  },
                  backgroundColor: selectedItemIndex === index ? 'primary.main' : '',
                  '& .MuiChip-label': {
                    color: selectedItemIndex === index ? '#fff' : '',
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
            }}
          >
            <Box
              sx={{
                backgroundImage: selectedFeature.imageLight,
                backgroundSize: 'contain', // Changed to contain
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat', // Ensure no repeat
                minHeight: 280,
              }}
            />
            <Box sx={{ px: 2, py: 2 }}>
              <Typography color="text.primary" variant="body2" fontWeight="bold">
                {selectedFeature.title}
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ my: 0.5 }}>
                {selectedFeature.description}
              </Typography>
              <Stack direction="row" spacing={2}>
                {selectedFeature.githubLink && (
                  <Link
                    color="primary"
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      '& > svg': { transition: '0.2s' },
                      '&:hover > svg': { transform: 'translateX(2px)' },
                    }}
                    onClick={(event) => {
                      window.open(selectedFeature.githubLink, '_blank');
                      event.stopPropagation();
                    }}
                  >
                    <GitHubIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <span>View Source on GitHub</span>
                  </Link>
                )}
                {selectedFeature.demoLink && (
                  <Link
                    color="primary"
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      '& > svg': { transition: '0.2s' },
                      '&:hover > svg': { transform: 'translateX(2px)' },
                    }}
                    onClick={(event) => {
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
                  p: 3,
                  height: 'fit-content',
                  width: '100%',
                  background: 'none',
                  backgroundColor:
                    selectedItemIndex === index ? 'action.selected' : undefined,
                  borderColor: (theme) => {
                    if (theme.palette.mode === 'light') {
                      return selectedItemIndex === index
                        ? 'primary.light'
                        : 'grey.200';
                    }
                    return selectedItemIndex === index ? 'primary.dark' : 'grey.800';
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
                      color: (theme) => {
                        if (theme.palette.mode === 'light') {
                          return selectedItemIndex === index
                            ? 'primary.main'
                            : 'grey.300';
                        }
                        return selectedItemIndex === index
                          ? 'primary.main'
                          : 'grey.700';
                      },
                    }}
                  >
                    {icon}
                  </Box>
                  <Box sx={{ textTransform: 'none' }}>
                    <Typography
                      color="text.primary"
                      variant="body2"
                      fontWeight="bold"
                    >
                      {title}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{ my: 0.5 }}
                    >
                      {description}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      {githubLink && ( // Use destructured variable
                        <Link
                          color="primary"
                          variant="body2"
                          fontWeight="bold"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            '& > svg': { transition: '0.2s' },
                            '&:hover > svg': { transform: 'translateX(2px)' },
                          }}
                          onClick={(event) => {
                            window.open(githubLink, '_blank');
                            event.stopPropagation();
                          }}
                        >
                          <GitHubIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <span>View Source on GitHub</span>
                        </Link>
                      )}
                      {demoLink && (
                        <Link
                          color="primary"
                          variant="body2"
                          fontWeight="bold"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            '& > svg': { transition: '0.2s' },
                            '&:hover > svg': { transform: 'translateX(2px)' },
                          }}
                          onClick={(event) => {
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
        <Grid sx={{ display: { xs: 'none', sm: 'flex' }, width: { xs: '100%', md: '50%' } }}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              width: '100%',
              display: { xs: 'none', sm: 'flex' },
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                m: 'auto',
                width: '100%', // Allow image to scale within bounds
                height: 500,
                backgroundSize: 'contain', // Changed to contain
                backgroundImage: selectedFeature.imageLight,
                backgroundRepeat: 'no-repeat', // Ensure no repeat
                backgroundPosition: 'center',
              }}
            />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}