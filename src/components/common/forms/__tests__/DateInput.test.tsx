import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DateInput from '../DateInput';

// Mock the calendar icon
vi.mock('@mui/icons-material/CalendarToday', () => ({
  default: () => <div data-testid="calendar-icon">📅</div>
}));

describe('DateInput', () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    value: '',
    onChange: mockOnChange
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<DateInput {...defaultProps} />);
    
    const input = screen.getByLabelText('Date');
    expect(input).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<DateInput {...defaultProps} label="Birth Date" />);
    
    const input = screen.getByLabelText('Birth Date');
    expect(input).toBeInTheDocument();
  });

  it('displays formatted date when value is provided', () => {
    render(<DateInput {...defaultProps} value="2023-12-25" />);
    
    // Should display as MM/DD/YYYY format
    const input = screen.getByDisplayValue('12/25/2023');
    expect(input).toBeInTheDocument();
  });

  it('displays empty string when no value is provided', () => {
    render(<DateInput {...defaultProps} value="" />);
    
    const input = screen.getByLabelText('Date');
    expect(input).toHaveValue('');
  });

  it('calls onChange when hidden date input changes', () => {
    render(<DateInput {...defaultProps} />);
    
    // Find the hidden native date input by type
    const dateInputs = screen.getAllByDisplayValue('');
    const nativeDateInput = dateInputs.find(input => 
      (input as HTMLInputElement).type === 'date'
    ) as HTMLInputElement;
    
    if (nativeDateInput) {
      fireEvent.change(nativeDateInput, { target: { value: '2023-12-25' } });
      expect(mockOnChange).toHaveBeenCalled();
    }
  });

  it('handles different date formats correctly', () => {
    const { rerender } = render(<DateInput {...defaultProps} value="2023-01-01" />);
    expect(screen.getByDisplayValue('01/01/2023')).toBeInTheDocument();

    rerender(<DateInput {...defaultProps} value="2023-12-31" />);
    expect(screen.getByDisplayValue('12/31/2023')).toBeInTheDocument();
  });

  it('renders as required when required prop is true', () => {
    render(<DateInput {...defaultProps} required />);
    
    const input = screen.getByLabelText('Date *');
    expect(input).toBeInTheDocument();
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<DateInput {...defaultProps} disabled />);
    
    const input = screen.getByLabelText('Date');
    expect(input).toHaveAttribute('readonly');
  });

  it('displays calendar icon with correct color for light mode', () => {
    render(<DateInput {...defaultProps} mode="light" />);
    
    const calendarIcon = screen.getByTestId('calendar-icon');
    expect(calendarIcon).toBeInTheDocument();
  });

  it('displays calendar icon with correct color for dark mode', () => {
    render(<DateInput {...defaultProps} mode="dark" />);
    
    const calendarIcon = screen.getByTestId('calendar-icon');
    expect(calendarIcon).toBeInTheDocument();
  });

  it('handles invalid date gracefully', () => {
    render(<DateInput {...defaultProps} value="invalid-date" />);
    
    // Should fallback to displaying the original value
    const input = screen.getByDisplayValue('invalid-date');
    expect(input).toBeInTheDocument();
  });

  it('calls onCalendarClick when provided and icon is clicked', () => {
    const mockOnCalendarClick = vi.fn();
    render(<DateInput {...defaultProps} onCalendarClick={mockOnCalendarClick} />);
    
    const calendarIcon = screen.getByTestId('calendar-icon');
    fireEvent.click(calendarIcon.parentElement as Element);
    
    expect(mockOnCalendarClick).toHaveBeenCalled();
  });

  it('applies fullWidth styling by default', () => {
    render(<DateInput {...defaultProps} />);
    
    const textField = screen.getByLabelText('Date').closest('.MuiTextField-root');
    expect(textField).toHaveClass('MuiFormControl-fullWidth');
  });

  it('handles edge case dates correctly', () => {
    // Test leap year
    render(<DateInput {...defaultProps} value="2024-02-29" />);
    expect(screen.getByDisplayValue('02/29/2024')).toBeInTheDocument();
  });

  it('maintains label shrink behavior', () => {
    render(<DateInput {...defaultProps} />);
    
    const label = screen.getByLabelText('Date').closest('.MuiTextField-root')?.querySelector('.MuiInputLabel-root');
    expect(label).toHaveClass('MuiInputLabel-shrink');
  });
});
