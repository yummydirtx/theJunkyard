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
import Divider from '@mui/material/Divider';
import PageLayout from '../components/PageLayout'; // Import PageLayout
import Features from '../components/LandingPage/Features';
import Testimonials from '../components/LandingPage/Testimonials';
import FAQ from '../components/LandingPage/FAQ';
import Me from '../components/LandingPage/Me';
import PastWebsites from '../components/LandingPage/PastWebsites';
import { useTitle } from '../components/useTitle';

/**
 * LandingPage component serves as the main entry point or homepage of the application.
 * It typically showcases features, testimonials, FAQs, and other introductory content.
 * @param {object} props - The component's props.
 * @param {function} props.setMode - Function to toggle the color mode (light/dark).
 * @param {string} props.mode - The current color mode ('light' or 'dark').
 */
export default function LandingPage({ setMode, mode }) {
  useTitle('theJunkyard: Landing Page');

  return (
    <PageLayout mode={mode} setMode={setMode} sx={{ bgcolor: 'background.default' }}>
      <Me />
      {/* Box with bgcolor is now part of PageLayout's sx prop or a nested Box if specific styling is needed */}
      <Features />
      <Divider />
      <Testimonials />
      <Divider />
      <FAQ />
      <Divider />
      <PastWebsites />
    </PageLayout>
  );
}
