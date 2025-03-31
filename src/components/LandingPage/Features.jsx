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
import CasinoIcon from '@mui/icons-material/Casino';
import TerminalIcon from '@mui/icons-material/Terminal';
import AnteaterFindLogo from '../../assets/anteaterfind.png';
import CalcBasic from '../../assets/calcbasic.png';
import LicenserH from '../../assets/licenser-h.png';
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
    icon: <CasinoIcon />,
    title: 'calcBasic-web',
    demoLink: './calcbasic-web',
    githubLink: 'https://github.com/yummydirtx/theJunkyard',
    description:
      'A random number generator that lets you win your own private lottery. It is a fun little program, initially created in BASIC for the TI-84, but now available on the web.',
    imageLight: ('url(' + CalcBasic + ')'),
  },
  {
    icon: <TerminalIcon />,
    title: 'licenser-h',
    demoLink: null,
    githubLink: 'https://github.com/yummydirtx/licenser-h',
    description:
      'An easy-to-use and robust license generator for your projects. It is a command-line tool that generates a license file and license headers for your project.',
    imageLight: 'url(' + LicenserH + ')',
  },
];

export default function Features() {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

  const handleItemClick = (index) => {
    setSelectedItemIndex(index);
  };

  const selectedFeature = items[selectedItemIndex];

  return (
    <Container id="features" sx={{ py: { xs: 4, sm: 4 } }}>
      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
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
          <Grid container item gap={1} sx={{ display: { xs: 'auto', sm: 'none' } }}>
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
                backgroundImage: items[selectedItemIndex].imageLight,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
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
                      window.open(selectedFeature.demoLink, '_blank');
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
            {items.map(({ icon, title, description, link }, index) => (
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
                      {items[index].githubLink && (
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
                            window.open(items[index].githubLink, '_blank');
                            event.stopPropagation();
                          }}
                        >
                          <GitHubIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <span>View Source on GitHub</span>
                        </Link>
                      )}
                      {items[index].demoLink && (
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
                            window.open(items[index].demoLink, '_blank');
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
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: { xs: 'none', sm: 'flex' }, width: '100%' }}
        >
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
                width: 420,
                height: 500,
                backgroundSize: 'contain',
                backgroundImage: items[selectedItemIndex].imageLight,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
