import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MoneyInput from '../MoneyInput';

describe('MoneyInput', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    value: '',
    onChange: mockOnChange
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<MoneyInput {...defaultProps} />);
    
    const input = screen.getByLabelText('Amount');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', '0.00');
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders with custom label and placeholder', () => {
    render(
      <MoneyInput 
        {...defaultProps} 
        label="Custom Amount" 
        placeholder="Enter amount"
      />
    );
    
    const input = screen.getByLabelText('Custom Amount');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter amount');
  });

  it('displays the provided value', () => {
    render(<MoneyInput {...defaultProps} value="123.45" />);
    
    const input = screen.getByDisplayValue('123.45');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange with sanitized value when valid input is entered', () => {
    render(<MoneyInput {...defaultProps} />);
    
    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: '123.45' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('123.45');
  });

  it('sanitizes input by removing non-numeric characters except decimal point', () => {
    render(<MoneyInput {...defaultProps} />);
    
    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: 'abc123.45def' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('123.45');
  });

  it('allows decimal points in input', () => {
    render(<MoneyInput {...defaultProps} />);
    
    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: '99.99' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('99.99');
  });

  it('removes special characters and letters', () => {
    render(<MoneyInput {...defaultProps} />);
    
    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: '$1,234.56!' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('1234.56');
  });

  it('renders as required when required prop is true', () => {
    render(<MoneyInput {...defaultProps} required />);
    
    const input = screen.getByLabelText('Amount *');
    expect(input).toBeRequired();
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<MoneyInput {...defaultProps} disabled />);
    
    const input = screen.getByLabelText('Amount');
    expect(input).toBeDisabled();
  });

  it('displays helper text when provided', () => {
    render(<MoneyInput {...defaultProps} helperText="Enter your budget amount" />);
    
    expect(screen.getByText('Enter your budget amount')).toBeInTheDocument();
  });

  it('handles numeric values as input', () => {
    render(<MoneyInput {...defaultProps} value={123.45} />);
    
    const input = screen.getByDisplayValue('123.45');
    expect(input).toBeInTheDocument();
  });

  it('applies fullWidth styling by default', () => {
    render(<MoneyInput {...defaultProps} />);
    
    const textField = screen.getByLabelText('Amount').closest('.MuiTextField-root');
    expect(textField).toHaveClass('MuiFormControl-fullWidth');
  });

  it('can disable fullWidth when explicitly set to false', () => {
    render(<MoneyInput {...defaultProps} fullWidth={false} />);
    
    const textField = screen.getByLabelText('Amount').closest('.MuiTextField-root');
    expect(textField).not.toHaveClass('MuiTextField-fullWidth');
  });
});
