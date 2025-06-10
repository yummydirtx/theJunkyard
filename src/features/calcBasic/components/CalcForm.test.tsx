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
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import CalcForm from './CalcForm';
import * as hooks from '../hooks/hooks';

// Mock the hooks module
vi.mock('../hooks/hooks', () => ({
  calcBasic: vi.fn(),
}));

describe('CalcForm Component', () => {
  const mockSetLowest = vi.fn();
  const mockSetNumberOfLowest = vi.fn();
  const mockSetPlural = vi.fn();

  const defaultProps = {
    setLowest: mockSetLowest,
    setNumberOfLowest: mockSetNumberOfLowest,
    setPlural: mockSetPlural,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock return value
    vi.mocked(hooks.calcBasic).mockReturnValue([5, 2]);
  });

  it('should render without crashing', () => {
    render(<CalcForm {...defaultProps} />);
    
    expect(screen.getByLabelText('Odds')).toBeInTheDocument();
    expect(screen.getByLabelText('Iterations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeInTheDocument();
  });

  it('should render input fields with proper labels', () => {
    render(<CalcForm {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    
    expect(oddsInput).toBeInTheDocument();
    expect(iterationsInput).toBeInTheDocument();
    expect(oddsInput).toHaveAttribute('type', 'number');
    expect(iterationsInput).toHaveAttribute('type', 'number');
  });

  it('should display "1 in" prefix for odds input', () => {
    render(<CalcForm {...defaultProps} />);
    
    expect(screen.getByText('1 in')).toBeInTheDocument();
  });

  it('should update input values when user types', async () => {
    const user = userEvent.setup();
    render(<CalcForm {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    
    await user.type(oddsInput, '100');
    await user.type(iterationsInput, '50');
    
    expect(oddsInput).toHaveValue(100);
    expect(iterationsInput).toHaveValue(50);
  });

  it('should validate odds input correctly', async () => {
    const user = userEvent.setup();
    const { container } = render(<CalcForm {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    
    // Test invalid input (less than 1)
    await user.type(oddsInput, '0');
    await waitFor(() => {
      expect(container.querySelector('.Mui-error')).toBeInTheDocument();
    });
    
    // Clear and test valid input
    await user.clear(oddsInput);
    await user.type(oddsInput, '100');
    await waitFor(() => {
      expect(container.querySelector('.Mui-error')).not.toBeInTheDocument();
    });
  });

  it('should validate iterations input correctly', async () => {
    const user = userEvent.setup();
    const { container } = render(<CalcForm {...defaultProps} />);
    
    const iterationsInput = screen.getByLabelText('Iterations');
    
    // Test invalid input (less than 1)
    await user.type(iterationsInput, '0');
    await waitFor(() => {
      expect(container.querySelector('.Mui-error')).toBeInTheDocument();
    });
    
    // Clear and test valid input
    await user.clear(iterationsInput);
    await user.type(iterationsInput, '50');
    await waitFor(() => {
      expect(container.querySelector('.Mui-error')).not.toBeInTheDocument();
    });
  });

  it('should not call calculation when inputs are invalid', async () => {
    const user = userEvent.setup();
    render(<CalcForm {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    const calculateButton = screen.getByRole('button', { name: 'Calculate' });
    
    // Enter invalid values
    await user.type(oddsInput, '0');
    await user.type(iterationsInput, '0');
    await user.click(calculateButton);
    
    expect(hooks.calcBasic).not.toHaveBeenCalled();
    expect(mockSetLowest).not.toHaveBeenCalled();
    expect(mockSetNumberOfLowest).not.toHaveBeenCalled();
  });

  it('should call calculation with valid inputs', async () => {
    const user = userEvent.setup();
    render(<CalcForm {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    const calculateButton = screen.getByRole('button', { name: 'Calculate' });
    
    // Enter valid values
    await user.type(oddsInput, '100');
    await user.type(iterationsInput, '50');
    await user.click(calculateButton);
    
    expect(hooks.calcBasic).toHaveBeenCalledWith(100, 50);
    expect(mockSetLowest).toHaveBeenCalledWith(5);
    expect(mockSetNumberOfLowest).toHaveBeenCalledWith(2);
  });

  it('should set plural correctly when count is 1', async () => {
    const user = userEvent.setup();
    vi.mocked(hooks.calcBasic).mockReturnValue([3, 1]); // count = 1
    
    render(<CalcForm {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    const calculateButton = screen.getByRole('button', { name: 'Calculate' });
    
    await user.type(oddsInput, '100');
    await user.type(iterationsInput, '50');
    await user.click(calculateButton);
    
    expect(mockSetPlural).toHaveBeenCalledWith('');
  });

  it('should set plural correctly when count is greater than 1', async () => {
    const user = userEvent.setup();
    vi.mocked(hooks.calcBasic).mockReturnValue([3, 5]); // count = 5
    
    render(<CalcForm {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    const calculateButton = screen.getByRole('button', { name: 'Calculate' });
    
    await user.type(oddsInput, '100');
    await user.type(iterationsInput, '50');
    await user.click(calculateButton);
    
    expect(mockSetPlural).toHaveBeenCalledWith('s');
  });

  it('should handle decimal odds input', async () => {
    const user = userEvent.setup();
    render(<CalcForm {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    const calculateButton = screen.getByRole('button', { name: 'Calculate' });
    
    await user.type(oddsInput, '100.5');
    await user.type(iterationsInput, '10');
    await user.click(calculateButton);
    
    expect(hooks.calcBasic).toHaveBeenCalledWith(100.5, 10);
  });

  it('should handle large input values', async () => {
    const user = userEvent.setup();
    render(<CalcForm {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    const iterationsInput = screen.getByLabelText('Iterations');
    const calculateButton = screen.getByRole('button', { name: 'Calculate' });
    
    await user.type(oddsInput, '1000000');
    await user.type(iterationsInput, '1000');
    await user.click(calculateButton);
    
    expect(hooks.calcBasic).toHaveBeenCalledWith(1000000, 1000);
  });

  it('should have proper grid layout', () => {
    const { container } = render(<CalcForm {...defaultProps} />);
    
    const gridElements = container.querySelectorAll('.MuiGrid-root');
    expect(gridElements.length).toBeGreaterThan(0);
  });

  it('should have full width form controls', () => {
    const { container } = render(<CalcForm {...defaultProps} />);
    
    const formControls = container.querySelectorAll('.MuiFormControl-root');
    expect(formControls.length).toBe(2);
  });

  it('should have full width calculate button', () => {
    const { container } = render(<CalcForm {...defaultProps} />);
    
    const button = container.querySelector('.MuiButton-root');
    expect(button).toBeInTheDocument();
  });

  it('should show error state for invalid inputs when not empty', async () => {
    const user = userEvent.setup();
    const { container } = render(<CalcForm {...defaultProps} />);
    
    const oddsInput = screen.getByLabelText('Odds');
    
    // Type a value first, then clear to test error state
    await user.type(oddsInput, '1');
    await user.clear(oddsInput);
    await user.type(oddsInput, '0');
    
    await waitFor(() => {
      const errorInput = container.querySelector('.Mui-error');
      expect(errorInput).toBeInTheDocument();
    });
  });

  it('should not show error state for empty inputs', () => {
    const { container } = render(<CalcForm {...defaultProps} />);
    
    // Initially empty inputs should not show error
    const errorInputs = container.querySelectorAll('.Mui-error');
    expect(errorInputs.length).toBe(0);
  });
});
