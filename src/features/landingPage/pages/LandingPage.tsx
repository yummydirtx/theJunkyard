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
import Divider from '@mui/material/Divider';
import PageLayout from '../../../components/layout/PageLayout';
import AnimatedHero from '../components/AnimatedHero';
import EnhancedFeatures from '../components/EnhancedFeatures';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import PastWebsites from '../components/PastWebsites';
import FloatingBackground from '../components/FloatingBackground';
import ScrollReveal from '../components/ScrollReveal';
import { useTitle } from '../../../hooks/useTitle';
import { LandingPageProps } from '../types/index';

/**
 * LandingPage component serves as the main entry point or homepage of the application.
 * It typically showcases features, testimonials, FAQs, and other introductory content.
 */
const LandingPage: React.FC<LandingPageProps> = ({ setMode, mode }) => {
  useTitle('theJunkyard: Landing Page');

  return (
    <PageLayout mode={mode} setMode={setMode} sx={{ bgcolor: 'background.default', position: 'relative' }}>
      <FloatingBackground />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <AnimatedHero />
        
        <ScrollReveal direction="fade" delay={0.2}>
          <EnhancedFeatures />
        </ScrollReveal>
        
        <Divider sx={{ my: 4 }} />
        
        <ScrollReveal direction="up" delay={0.1}>
          <Testimonials />
        </ScrollReveal>
        
        <Divider sx={{ my: 4 }} />
        
        <ScrollReveal direction="up" delay={0.1}>
          <FAQ />
        </ScrollReveal>
        
        <Divider sx={{ my: 4 }} />
        
        <ScrollReveal direction="up" delay={0.1}>
          <PastWebsites />
        </ScrollReveal>
      </Box>
    </PageLayout>
  );
};

export default LandingPage;
