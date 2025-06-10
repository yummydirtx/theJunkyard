import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ToggleColorMode from '../ToggleColorMode';

const mockToggleColorMode = vi.fn();

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

describe('ToggleColorMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <ToggleColorMode mode="light" toggleColorMode={mockToggleColorMode} />
      </ThemeProvider>
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows dark mode icon when in light theme', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <ToggleColorMode mode="light" toggleColorMode={mockToggleColorMode} />
      </ThemeProvider>
    );
    
    // Should show ModeNightRounded icon (moon icon) when in light theme
    expect(screen.getByTestId('ModeNightRoundedIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('WbSunnyRoundedIcon')).not.toBeInTheDocument();
  });

  it('shows light mode icon when in dark theme', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <ToggleColorMode mode="dark" toggleColorMode={mockToggleColorMode} />
      </ThemeProvider>
    );
    
    // Should show WbSunnyRounded icon (sun icon) when in dark theme
    expect(screen.getByTestId('WbSunnyRoundedIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('ModeNightRoundedIcon')).not.toBeInTheDocument();
  });

  it('calls toggleColorMode when clicked', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <ToggleColorMode mode="light" toggleColorMode={mockToggleColorMode} />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockToggleColorMode).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility attributes', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <ToggleColorMode mode="light" toggleColorMode={mockToggleColorMode} />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'button to toggle theme');
  });

  it('is styled as a Button', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <ToggleColorMode mode="light" toggleColorMode={mockToggleColorMode} />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    // Button should have the MuiButton class
    expect(button.className).toContain('MuiButton');
  });

  it('handles multiple clicks correctly', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <ToggleColorMode mode="light" toggleColorMode={mockToggleColorMode} />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    expect(mockToggleColorMode).toHaveBeenCalledTimes(3);
  });

  it('handles keyboard interaction', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <ToggleColorMode mode="light" toggleColorMode={mockToggleColorMode} />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    button.focus();
    
    // Button should handle focus correctly
    expect(button).toHaveFocus();
  });
});
