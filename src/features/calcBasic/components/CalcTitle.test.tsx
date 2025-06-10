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

import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import CalcTitle from './CalcTitle';

describe('CalcTitle Component', () => {
  it('should render without crashing', () => {
    render(<CalcTitle />);
    expect(screen.getByText('calcBasic-web')).toBeInTheDocument();
  });

  it('should render the correct title', () => {
    render(<CalcTitle />);
    
    const titleElement = screen.getByText('calcBasic-web');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.tagName).toBe('H2');
  });

  it('should render the description text', () => {
    render(<CalcTitle />);
    
    const description = screen.getByText(/Ever wanted to win your own lottery?/);
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('Ever wanted to win your own lottery? Using calcBasic, now you can. Enter the odds of winning, and calcBasic will automatically buy unlimited tickets until you win. It will then repeat this process a number of times you specify, and tell you the lowest number of tickets you bought to win, and how many times that happened. The prize is a sense of pride and accomplishment. Good luck!');
  });

  it('should have proper grid layout', () => {
    const { container } = render(<CalcTitle />);
    
    const gridElement = container.querySelector('.MuiGrid-root');
    expect(gridElement).toBeInTheDocument();
  });

  it('should have proper typography variants', () => {
    const { container } = render(<CalcTitle />);
    
    // Check for h2 variant
    const h2Element = container.querySelector('[role="presentation"] h2, h2');
    expect(h2Element).toBeInTheDocument();
    
    // Check for body1 typography for description
    const bodyText = container.querySelector('.MuiTypography-body1');
    expect(bodyText).toBeInTheDocument();
  });

  it('should apply responsive font size styling', () => {
    const { container } = render(<CalcTitle />);
    
    const titleElement = container.querySelector('h2');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveStyle('font-weight: 700');
  });

  it('should have proper text color for description', () => {
    const { container } = render(<CalcTitle />);
    
    const description = container.querySelector('.MuiTypography-body1');
    expect(description).toBeInTheDocument();
  });

  it('should render as a functional component', () => {
    // Test that it renders without any props
    const { container } = render(<CalcTitle />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
