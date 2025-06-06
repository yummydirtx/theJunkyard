import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmationDialog from '../ConfirmationDialog';

describe('ConfirmationDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Test Title',
    message: 'Test message content'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message content')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<ConfirmationDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('calls onClose with false when Cancel button is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnClose).toHaveBeenCalledWith(false);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls both onConfirm and onClose when Confirm button is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Confirm'));
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledWith(false);
  });

  it('calls onClose with false when dialog backdrop is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    // Find the dialog and simulate backdrop click by pressing escape
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledWith(false);
  });

  it('renders with custom title and message', () => {
    const customProps = {
      ...defaultProps,
      title: 'Custom Dialog Title',
      message: 'Are you sure you want to delete this item?'
    };

    render(<ConfirmationDialog {...customProps} />);
    
    expect(screen.getByText('Custom Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('has correct color styling on confirm button', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('MuiButton-colorError');
  });
});
