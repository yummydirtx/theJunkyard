import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPrompt from '../LoginPrompt';

describe('LoginPrompt', () => {
  const mockOpenLoginModal = vi.fn();
  const mockOpenSignUpModal = vi.fn();

  const defaultProps = {
    openLoginModal: mockOpenLoginModal,
    openSignUpModal: mockOpenSignUpModal,
    loading: false,
    user: null,
    app_title: 'Test App'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when not loading and no user', () => {
    render(<LoginPrompt {...defaultProps} />);
    
    expect(screen.getByText('Please log in to use Test App')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('does not render when loading', () => {
    render(<LoginPrompt {...defaultProps} loading={true} />);
    
    // The Fade component should not show content when loading is true
    const message = screen.queryByText('Please log in to use Test App');
    expect(message).not.toBeInTheDocument();
  });

  it('does not render when user is present', () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    render(<LoginPrompt {...defaultProps} user={mockUser} />);
    
    // The Fade component should not show content when user is present
    const message = screen.queryByText('Please log in to use Test App');
    expect(message).not.toBeInTheDocument();
  });

  it('calls openSignUpModal when Sign Up button is clicked', () => {
    render(<LoginPrompt {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Sign Up'));
    
    expect(mockOpenSignUpModal).toHaveBeenCalledTimes(1);
    expect(mockOpenLoginModal).not.toHaveBeenCalled();
  });

  it('calls openLoginModal when Log In button is clicked', () => {
    render(<LoginPrompt {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Log In'));
    
    expect(mockOpenLoginModal).toHaveBeenCalledTimes(1);
    expect(mockOpenSignUpModal).not.toHaveBeenCalled();
  });

  it('displays custom app title in message', () => {
    render(<LoginPrompt {...defaultProps} app_title="My Budget App" />);
    
    expect(screen.getByText('Please log in to use My Budget App')).toBeInTheDocument();
  });

  it('has correct button styling', () => {
    render(<LoginPrompt {...defaultProps} />);
    
    const signUpButton = screen.getByText('Sign Up');
    const logInButton = screen.getByText('Log In');
    
    expect(signUpButton).toHaveClass('MuiButton-contained');
    expect(logInButton).toHaveClass('MuiButton-contained');
    expect(signUpButton).toHaveClass('MuiButton-colorPrimary');
    expect(logInButton).toHaveClass('MuiButton-colorPrimary');
  });

  it('renders with proper layout structure', () => {
    render(<LoginPrompt {...defaultProps} />);
    
    // Check for centered layout
    const container = screen.getByText('Please log in to use Test App').closest('div');
    expect(container).toHaveStyle({ textAlign: 'center' });
  });
});
