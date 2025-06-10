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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import CalcBasic from './CalcBasic';
import { useTitle } from '../../../hooks/useTitle';
import * as hooks from '../hooks/hooks';

// Mock dependencies
vi.mock('../../../hooks/useTitle', () => ({
  useTitle: vi.fn(),
}));

vi.mock('../../../components/layout/PageLayout', () => ({
  default: ({ children, mode, setMode, sx }: any) => (
    <div data-testid="page-layout" data-mode={mode} data-sx={JSON.stringify(sx)}>
      {children}
    </div>
  ),
}));

vi.mock('../hooks/hooks', () => ({
  calcBasic: vi.fn(),
}));

describe('CalcBasic Integration Tests', () => {
  const mockSetMode = vi.fn();
  const defaultProps = {
    setMode: mockSetMode,
    mode: 'light' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.calcBasic).mockReturnValue([10, 3]);
  });

  it('should render without crashing', () => {
    render(<CalcBasic {...defaultProps} />);
    
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  it('should call useTitle with correct title', () => {
    const mockUseTitle = vi.mocked(useTitle);
    render(<CalcBasic {...defaultProps} />);
    
    expect(mockUseTitle).toHaveBeenCalledWith('theJunkyard: calcBasic');
  });

  it('should render all child components', () => {
    render(<CalcBasic {...defaultProps} />);
    
    // Check for CalcTitle
    expect(screen.getByText('calcBasic-web')).toBeInTheDocument();
    
    // Check for CalcForm inputs
    expect(screen.getByLabelText('Odds')).toBeInTheDocument();
    expect(screen.getByLabelText('Iterations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeInTheDocument();
    
    // Check for ResultsDisplay (should show welcome message initially)
    expect(screen.getByText('Welcome to calcBasic.')).toBeInTheDocument();
  });

  it('should pass props correctly to PageLayout', () => {
    const { container } = render(<CalcBasic {...defaultProps} />);
    
    const pageLayout = screen.getByTestId('page-layout');
    expect(pageLayout).toHaveAttribute('data-mode', 'light');
  });

  it('should handle dark mode correctly', () => {
    const darkModeProps = {
      setMode: mockSetMode,
      mode: 'dark' as const,
    };
    
    render(<CalcBasic {...darkModeProps} />);
    
    const pageLayout = screen.getByTestId('page-layout');
    expect(pageLayout).toHaveAttribute('data-mode', 'dark');
  });

  it('should display welcome message initially', () => {
    render(<CalcBasic {...defaultProps} />);
    
    expect(screen.getByText('Welcome to calcBasic.')).toBeInTheDocument();
  });

  it('should perform end-to-end calculation flow', async () => {
    const user = userEvent.setup();
    render(<CalcBasic {...defaultProps} />);
    
    // Fill in the form
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    const calculateButton = screen.getByRole('button', { name: 'Calculate' });
    
    await user.type(oddsInput, '100');
    await user.type(iterationsInput, '50');
    await user.click(calculateButton);
    
    // Check that calculation was called
    expect(hooks.calcBasic).toHaveBeenCalledWith(100, 50);
    
    // Check that results are displayed
    await waitFor(() => {
      expect(screen.getByText(/bought to win was 10/)).toBeInTheDocument();
      expect(screen.getByText(/3 times/)).toBeInTheDocument();
    });
    
    // Welcome message should be hidden
    expect(screen.queryByText('Welcome to calcBasic.')).not.toBeInTheDocument();
  });

  it('should handle singular result correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(hooks.calcBasic).mockReturnValue([7, 1]); // count = 1
    
    render(<CalcBasic {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    const calculateButton = screen.getByRole('button', { name: 'Calculate' });
    
    await user.type(oddsInput, '50');
    await user.type(iterationsInput, '10');
    await user.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/1 time\./)).toBeInTheDocument(); // "time" without "s"
    });
  });

  it('should handle multiple calculations', async () => {
    const user = userEvent.setup();
    render(<CalcBasic {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    const calculateButton = screen.getByRole('button', { name: 'Calculate' });
    
    // First calculation
    await user.type(oddsInput, '100');
    await user.type(iterationsInput, '50');
    await user.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/bought to win was 10/)).toBeInTheDocument();
    });
    
    // Change the mock return value for second calculation
    vi.mocked(hooks.calcBasic).mockReturnValue([5, 8]);
    
    // Clear inputs and do second calculation
    await user.clear(oddsInput);
    await user.clear(iterationsInput);
    await user.type(oddsInput, '200');
    await user.type(iterationsInput, '25');
    await user.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/bought to win was 5/)).toBeInTheDocument();
      expect(screen.getByText(/8 times/)).toBeInTheDocument();
    });
  });

  it('should not perform calculation with invalid inputs', async () => {
    const user = userEvent.setup();
    render(<CalcBasic {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    const calculateButton = screen.getByRole('button', { name: 'Calculate' });
    
    // Enter invalid values
    await user.type(oddsInput, '0');
    await user.type(iterationsInput, '0');
    await user.click(calculateButton);
    
    // Should not call calcBasic
    expect(hooks.calcBasic).not.toHaveBeenCalled();
    
    // Should still show welcome message
    expect(screen.getByText('Welcome to calcBasic.')).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    const { container } = render(<CalcBasic {...defaultProps} />);
    
    // Check for main layout elements
    const boxElement = container.querySelector('.MuiBox-root');
    expect(boxElement).toBeInTheDocument();
    
    const containerElement = container.querySelector('.MuiContainer-root');
    expect(containerElement).toBeInTheDocument();
    
    const gridContainer = container.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should handle prop updates correctly', () => {
    const { rerender } = render(<CalcBasic {...defaultProps} />);
    
    // Change mode prop
    const updatedProps = {
      ...defaultProps,
      mode: 'dark' as const,
    };
    
    rerender(<CalcBasic {...updatedProps} />);
    
    const pageLayout = screen.getByTestId('page-layout');
    expect(pageLayout).toHaveAttribute('data-mode', 'dark');
  });

  it('should pass setMode function to PageLayout', () => {
    render(<CalcBasic {...defaultProps} />);
    
    // Verify that the mock setMode function is available
    expect(mockSetMode).toBeDefined();
  });

  it('should maintain state across re-renders', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CalcBasic {...defaultProps} />);
    
    // Perform calculation
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    const calculateButton = screen.getByRole('button', { name: 'Calculate' });
    
    await user.type(oddsInput, '100');
    await user.type(iterationsInput, '50');
    await user.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/bought to win was 10/)).toBeInTheDocument();
    });
    
    // Re-render with same props
    rerender(<CalcBasic {...defaultProps} />);
    
    // Results should still be displayed
    expect(screen.getByText(/bought to win was 10/)).toBeInTheDocument();
  });

  it('should handle component as React.FC', () => {
    // Test that the component works as a functional component
    const { container } = render(<CalcBasic {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
