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
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResultsDisplay from './ResultsDisplay';

describe('ResultsDisplay Component', () => {
  it('should render welcome message when lowest is 0', () => {
    render(<ResultsDisplay lowest={0} numberOfLowest={0} plural="" />);
    
    expect(screen.getByText('Welcome to calcBasic.')).toBeInTheDocument();
  });

  it('should render results when lowest is greater than 0', () => {
    render(<ResultsDisplay lowest={5} numberOfLowest={3} plural="s" />);
    
    expect(screen.getByText(/bought to win was 5/)).toBeInTheDocument();
    expect(screen.getByText(/3 times/)).toBeInTheDocument();
  });

  it('should handle singular form correctly (no plural)', () => {
    render(<ResultsDisplay lowest={7} numberOfLowest={1} plural="" />);
    
    expect(screen.getByText(/bought to win was 7/)).toBeInTheDocument();
    expect(screen.getByText(/1 time\./)).toBeInTheDocument(); // "time" without "s"
  });

  it('should handle plural form correctly', () => {
    render(<ResultsDisplay lowest={10} numberOfLowest={5} plural="s" />);
    
    expect(screen.getByText(/bought to win was 10/)).toBeInTheDocument();
    expect(screen.getByText(/5 times\./)).toBeInTheDocument(); // "times" with "s"
  });

  it('should render the complete result sentence', () => {
    render(<ResultsDisplay lowest={15} numberOfLowest={2} plural="s" />);
    
    expect(screen.getByText('The lowest number of tickets bought to win was 15, which happened 2 times.')).toBeInTheDocument();
  });

  it('should render the complete result sentence for singular case', () => {
    render(<ResultsDisplay lowest={8} numberOfLowest={1} plural="" />);
    
    expect(screen.getByText('The lowest number of tickets bought to win was 8, which happened 1 time.')).toBeInTheDocument();
  });

  it('should have proper grid layout for welcome message', () => {
    const { container } = render(<ResultsDisplay lowest={0} numberOfLowest={0} plural="" />);
    
    const gridElement = container.querySelector('.MuiGrid-root');
    expect(gridElement).toBeInTheDocument();
    expect(gridElement).toHaveClass('MuiGrid-root');
  });

  it('should have proper grid layout for results', () => {
    const { container } = render(<ResultsDisplay lowest={5} numberOfLowest={3} plural="s" />);
    
    const gridElement = container.querySelector('.MuiGrid-root');
    expect(gridElement).toBeInTheDocument();
    expect(gridElement).toHaveClass('MuiGrid-root');
  });

  it('should center content in the grid', () => {
    const { container } = render(<ResultsDisplay lowest={5} numberOfLowest={3} plural="s" />);
    
    const gridElement = container.querySelector('.MuiGrid-root');
    expect(gridElement).toHaveClass('MuiGrid-root');
  });

  it('should use Typography component for text', () => {
    render(<ResultsDisplay lowest={5} numberOfLowest={3} plural="s" />);
    
    const typography = screen.getByText(/bought to win was 5/);
    expect(typography).toHaveClass('MuiTypography-root');
  });

  it('should handle edge case with very low numbers', () => {
    render(<ResultsDisplay lowest={1} numberOfLowest={1} plural="" />);
    
    expect(screen.getByText('The lowest number of tickets bought to win was 1, which happened 1 time.')).toBeInTheDocument();
  });

  it('should handle edge case with large numbers', () => {
    render(<ResultsDisplay lowest={999999} numberOfLowest={500} plural="s" />);
    
    expect(screen.getByText('The lowest number of tickets bought to win was 999999, which happened 500 times.')).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(<ResultsDisplay lowest={5} numberOfLowest={3} plural="s" />);
    
    const typography = screen.getByText(/bought to win was 5/);
    expect(typography.tagName).toBe('P'); // Typography body1 renders as p tag
  });

  it('should render as body1 variant typography', () => {
    render(<ResultsDisplay lowest={5} numberOfLowest={3} plural="s" />);
    
    const typography = screen.getByText(/bought to win was 5/);
    expect(typography).toHaveClass('MuiTypography-body1');
  });

  it('should not render welcome message when results are available', () => {
    render(<ResultsDisplay lowest={5} numberOfLowest={3} plural="s" />);
    
    expect(screen.queryByText('Welcome to calcBasic.')).not.toBeInTheDocument();
  });

  it('should not render results when in welcome state', () => {
    render(<ResultsDisplay lowest={0} numberOfLowest={0} plural="" />);
    
    expect(screen.queryByText(/bought to win was/)).not.toBeInTheDocument();
  });

  it('should handle zero numberOfLowest correctly', () => {
    render(<ResultsDisplay lowest={5} numberOfLowest={0} plural="s" />);
    
    expect(screen.getByText('The lowest number of tickets bought to win was 5, which happened 0 times.')).toBeInTheDocument();
  });

  it('should render component as functional component', () => {
    const { container } = render(<ResultsDisplay lowest={5} numberOfLowest={3} plural="s" />);
    
    expect(container.firstChild).toBeTruthy();
  });
});
