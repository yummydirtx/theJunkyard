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

/**
 * Type definitions for Landing Page components and related functionality
 */

export type ColorMode = 'light' | 'dark';

export interface FeatureItem {
  /** React icon component for the feature */
  icon: React.ReactElement;
  /** Title of the feature */
  title: string;
  /** Link to demo or live version of the feature */
  demoLink?: string;
  /** Link to GitHub repository */
  githubLink?: string;
  /** Description of the feature */
  description: string;
  /** Background image URL for the feature */
  imageLight: string;
}

export interface PastWebsiteItem {
  /** React icon or image component for the website */
  icon: React.ReactElement;
  /** Title of the website */
  title: string;
  /** Link to the archived version of the website */
  link: string;
  /** Description of the website */
  description: string;
  /** Background image URL for the website */
  imageLight: string;
  /** Whether the website is still active (true) or archived (false) */
  isActive?: boolean;
}

export interface TestimonialItem {
  /** Avatar component for the testimonial author */
  avatar: React.ReactElement;
  /** Name of the person giving the testimonial */
  name: string;
  /** Occupation or title of the person */
  occupation: string;
  /** The testimonial text */
  testimonial: string;
}

export interface LandingPageProps {
  /** Function to toggle the color mode (light/dark) */
  setMode: (mode: ColorMode) => void;
  /** The current color mode ('light' or 'dark') */
  mode: ColorMode;
}

export interface PageLayoutProps {
  /** Child components to render inside the layout */
  children: React.ReactNode;
  /** Function to toggle the color mode (light/dark) */
  setMode: (mode: ColorMode) => void;
  /** The current color mode ('light' or 'dark') */
  mode: ColorMode;
  /** Additional styling properties for the layout container */
  sx?: Record<string, any>;
}
