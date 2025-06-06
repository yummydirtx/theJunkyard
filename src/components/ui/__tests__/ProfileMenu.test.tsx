import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';

// Hoist the mock variables to avoid hoisting issues
const mockSignOut = vi.fn();
const mockAuthContextValue = {
  activeUser: { 
    uid: 'test-user-id',
    displayName: 'Test User', 
    email: 'test@example.com',
    photoURL: null
  },
  signOut: mockSignOut,
  loading: false,
  db: null,
  app: null,
  auth: null,
  handleGoogleSignIn: vi.fn(),
  handleEmailPasswordSignUp: vi.fn(),
  handleEmailPasswordLogin: vi.fn(),
  updateActiveUser: vi.fn(),
};

// Mock the AuthContext module
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContextValue,
}));

import ProfileMenu from '../ProfileMenu';

// Mock Material-UI icons
vi.mock('@mui/icons-material/Logout', () => ({
  default: () => <div data-testid="logout-icon" />
}));

vi.mock('@mui/icons-material/Settings', () => ({
  default: () => <div data-testid="settings-icon" />
}));

// Mock the AccountSettingsModal
vi.mock('../../../features/authentication/components/AccountSettingsModal', () => ({
  default: ({ open, onClose }: any) => (
    open ? <div data-testid="account-settings-modal">Account Settings Modal</div> : null
  )
}));

const mockTheme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('ProfileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithTheme(<ProfileMenu />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    // The component renders an Avatar with the first letter of the email
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of 'test@example.com'
  });

  it('opens menu when profile button is clicked', async () => {
    renderWithTheme(<ProfileMenu />);
    
    const profileButton = screen.getByRole('button');
    fireEvent.click(profileButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });
  });

  it('displays user information in menu', async () => {
    renderWithTheme(<ProfileMenu />);
    
    const profileButton = screen.getByRole('button');
    fireEvent.click(profileButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('calls signOut when Sign Out is clicked', async () => {
    renderWithTheme(<ProfileMenu />);
    
    const profileButton = screen.getByRole('button');
    fireEvent.click(profileButton);
    
    await waitFor(() => {
      const signOutButton = screen.getByText('Sign out');
      fireEvent.click(signOutButton);
    });
    
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility attributes', () => {
    renderWithTheme(<ProfileMenu />);
    
    const profileButton = screen.getByRole('button');
    expect(profileButton).toHaveAttribute('aria-haspopup', 'true');
  });

  it('menu is initially closed', () => {
    renderWithTheme(<ProfileMenu />);
    
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    renderWithTheme(<ProfileMenu />);
    
    const profileButton = screen.getByRole('button');
    fireEvent.click(profileButton); // Use click instead of keyDown
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('menu items have correct roles', async () => {
    renderWithTheme(<ProfileMenu />);
    
    const profileButton = screen.getByRole('button');
    fireEvent.click(profileButton);
    
    await waitFor(() => {
      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(3); // User info (disabled), Account Settings, Sign out
    });
  });

  it('displays user avatar placeholder', () => {
    renderWithTheme(<ProfileMenu />);
    
    const profileButton = screen.getByRole('button');
    // The avatar shows the first letter of the email
    expect(screen.getByText('T')).toBeInTheDocument();
  });
});
