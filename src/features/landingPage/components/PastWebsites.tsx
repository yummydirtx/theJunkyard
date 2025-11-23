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
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LanguageIcon from '@mui/icons-material/Language';
import Yummydirt from '../../../assets/yummydirt.png';
import YummyLogo from '../../../assets/yummylogo.png';
import MaiSchool from '../../../assets/maischool.png';
import MaiLogo from '../../../assets/Mai.ico';
import FrutkinLogo from '../../../assets/frutkinlogo.ico';
import FrutkinCom from '../../../assets/frutkincom.png';
import { PastWebsiteItem } from '../types/index';
import Browser3D from './Browser3D';

const items: PastWebsiteItem[] = [
  {
    icon: <img src={MaiLogo} alt="Mai Logo" width={50} />,
    title: 'Mai.School (2025-Present)',
    link: 'https://mai.school',
    description:
      'The official website for Mai School, a start-up providing personalized education for home and micro school students with an AI teacher that knows each child personally and works with parents and teachers. I was the lead developer in charge of building the website from scratch using Next.Js, Vercel, React, TypeScript, and Material-UI.',
    imageLight: ('url(' + MaiSchool + ')'),
    isActive: true,
  },
  {
    icon: <img src={FrutkinLogo} alt="Frutkin Logo" width={50} />,
    title: 'Frutkin.com (2021-Present)',
    link: 'https://frutkin.com',
    description:
      'Frutkin.com is the official Frutkin family website, and I took initiative to recreate it using modern web development technologies. The site features information about our family and our professional endeavors.',
    imageLight: 'url(' + FrutkinCom + ')',
    isActive: true,
  },
  {
    icon: <img src={YummyLogo} alt="YummyDirt Logo" width={50} />,
    title: 'yummydirt.com (2016-2018)',
    link: 'https://web.archive.org/web/20161106100941/http://www.yummydirt.com/',
    description:
      'My first personal website, created in 2016. I was 10 years old at the beginning of this project, and I created it using a text editor, HTML, CSS, and very basic JavaScript. It was a fun project, and I learned a lot from it.',
    imageLight: ('url(' + Yummydirt + ')'),
    isActive: false,
  },
];

const PastWebsites: React.FC = () => {
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
      id="websites"
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
            Past Websites
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
            A collection of my past personal websites, showcasing my journey in web development
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
          {/* Left: Website Cards */}
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
                      overflow: 'hidden',
                      background: (theme) =>
                        selectedItemIndex === index
                          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                          : theme.palette.mode === 'light'
                          ? 'grey.100'
                          : 'grey.800',
                      transition: 'all 0.3s ease',
                      '& img': {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
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
                        window.open(item.link, '_blank');
                      }}
                    >
                      <LanguageIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <span>{item.isActive ? 'Visit Site' : 'Visit Archive'}</span>
                      <ChevronRightRoundedIcon fontSize="small" sx={{ ml: 0.25 }} />
                    </Link>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>

          {/* Right: 3D Browser Window */}
          <Browser3D 
            title={selectedFeature.title}
            imageUrl={selectedFeature.imageLight}
            variant="desktop"
          />
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
                icon={<Box sx={{ width: 20, height: 20, overflow: 'hidden', borderRadius: '50%', '& img': { width: '100%', height: '100%', objectFit: 'cover' } }}>{item.icon}</Box>}
                label={item.title.split(' ')[0]}
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
          <Browser3D 
            title={selectedFeature.title}
            imageUrl={selectedFeature.imageLight}
            variant="mobile"
          />

          {/* Selected Website Details */}
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
            <Button
              size="small"
              variant="contained"
              startIcon={<LanguageIcon />}
              endIcon={<ChevronRightRoundedIcon />}
              onClick={() => window.open(selectedFeature.link, '_blank')}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {selectedFeature.isActive ? 'Visit Site' : 'Visit Archive'}
            </Button>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default PastWebsites;
