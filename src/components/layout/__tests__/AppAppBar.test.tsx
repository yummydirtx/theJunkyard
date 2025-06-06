import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { useState } from 'react';
import AppAppBar from '../AppAppBar';

// Mock the AuthContext
const mockAuthContext = {
  activeUser: null,
  loading: false,
  db: null,
  app: null,
};

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock the child components
vi.mock('../navigation/DesktopNavigation', () => ({
  default: () => <div data-testid="desktop-navigation">Desktop Navigation</div>,
}));

vi.mock('../navigation/MobileNavigation', () => ({
  default: ({ open, onClose, onOpenLoginModal, onOpenSignUpModal, loading, activeUser }: any) => (
    <div data-testid="mobile-navigation">
      <div data-testid="mobile-nav-open">{open ? 'open' : 'closed'}</div>
      <button onClick={onClose} data-testid="mobile-nav-close">Close</button>
      {(!loading && !activeUser) && (
        <>
          <button onClick={onOpenLoginModal} data-testid="mobile-nav-login">Login</button>
          <button onClick={onOpenSignUpModal} data-testid="mobile-nav-signup">Sign Up</button>
        </>
      )}
    </div>
  ),
}));

vi.mock('../../ui/ProfileMenu', () => ({
  default: ({ sx }: any) => (
    <button aria-haspopup="true" style={sx} data-testid="profile-menu-button">
      <div>T</div>
    </button>
  ),
}));

vi.mock('../../ui/ToggleColorMode', () => ({
  default: ({ mode, toggleColorMode }: any) => (
    <div data-testid="toggle-color-mode">
      <button onClick={toggleColorMode} aria-label="button to toggle theme">
        {mode === 'dark' ? 'Sun Icon' : 'Moon Icon'}
      </button>
    </div>
  ),
}));

vi.mock('../../features/authentication/components/LoginModal', () => ({
  default: ({ open, onClose }: any) => (
    open ? (
      <div data-testid="login-modal">
        <button onClick={onClose} data-testid="close-login-modal">Close Login</button>
      </div>
    ) : null
  ),
}));

vi.mock('../../features/authentication/components/SignUpModal', () => ({
  default: ({ open, onClose }: any) => (
    open ? (
      <div data-testid="signup-modal">
        <button onClick={onClose} data-testid="close-signup-modal">Close SignUp</button>
      </div>
    ) : null
  ),
}));

vi.mock('../hooks/useThemeHandler', () => ({
  useThemeHandler: () => ({
    handleThemeChange: vi.fn(),
  }),
}));

vi.mock('../../hooks/useModal', () => ({
  default: (initialValue: boolean) => {
    const [isOpen, setIsOpen] = useState(initialValue);
    return [isOpen, () => setIsOpen(true), () => setIsOpen(false)];
  },
}));

const mockTheme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={mockTheme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('AppAppBar', () => {
  const mockToggleColorMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockAuthContext, {
      activeUser: null,
      loading: false,
      db: null,
      app: null,
    });
  });

  it('renders without crashing', () => {
    renderWithTheme(
      <AppAppBar mode="light" toggleColorMode={mockToggleColorMode} />
    );
    
    expect(screen.getByAltText('logo of theJunkyard')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-navigation')).toBeInTheDocument();
  });

  it('displays logo and navigation', () => {
    renderWithTheme(
      <AppAppBar mode="light" toggleColorMode={mockToggleColorMode} />
    );
    
    const logo = screen.getByAltText('logo of theJunkyard');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src');
    expect(screen.getByTestId('desktop-navigation')).toBeInTheDocument();
  });

  it('shows login and signup buttons when user is not authenticated', () => {
    renderWithTheme(
      <AppAppBar mode="light" toggleColorMode={mockToggleColorMode} />
    );
    
    // Use getAllByText since "Sign Up" appears in both desktop and mobile nav
    const signUpButtons = screen.getAllByText('Sign Up');
    expect(signUpButtons.length).toBeGreaterThan(0);
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('shows profile menu when user is authenticated', () => {
    Object.assign(mockAuthContext, {
      activeUser: { uid: 'test-user', email: 'test@example.com' },
      loading: false,
    });

    renderWithTheme(
      <AppAppBar mode="light" toggleColorMode={mockToggleColorMode} />
    );
    
    const profileMenuButtons = screen.getAllByTestId('profile-menu-button');
    expect(profileMenuButtons.length).toBeGreaterThan(0);
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    expect(screen.queryByText('Log In')).not.toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    Object.assign(mockAuthContext, {
      activeUser: null,
      loading: true,
    });

    renderWithTheme(
      <AppAppBar mode="light" toggleColorMode={mockToggleColorMode} />
    );
    
    // Should not show auth buttons or profile menu while loading
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    expect(screen.queryByText('Log In')).not.toBeInTheDocument();
    expect(screen.queryByTestId('profile-menu')).not.toBeInTheDocument();
  });

  it('opens mobile navigation when menu button is clicked', () => {
    renderWithTheme(
      <AppAppBar mode="light" toggleColorMode={mockToggleColorMode} />
    );
    
    const menuButton = screen.getByLabelText('menu');
    fireEvent.click(menuButton);
    
    expect(screen.getByTestId('mobile-nav-open')).toHaveTextContent('open');
  });

  it('closes mobile navigation when close button is clicked', () => {
    renderWithTheme(
      <AppAppBar mode="light" toggleColorMode={mockToggleColorMode} />
    );
    
    // Open mobile nav first
    const menuButton = screen.getByLabelText('menu');
    fireEvent.click(menuButton);
    
    // Then close it
    const closeButton = screen.getByTestId('mobile-nav-close');
    fireEvent.click(closeButton);
    
    expect(screen.getByTestId('mobile-nav-open')).toHaveTextContent('closed');
  });

  it('handles logo click navigation', () => {
    // Mock window.open
    const mockWindowOpen = vi.fn();
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true,
    });

    renderWithTheme(
      <AppAppBar mode="light" toggleColorMode={mockToggleColorMode} />
    );
    
    const logo = screen.getByAltText('logo of theJunkyard');
    fireEvent.click(logo);
    
    expect(mockWindowOpen).toHaveBeenCalledWith('/', '_self');
  });

  it('shows theme toggle button', () => {
    renderWithTheme(
      <AppAppBar mode="light" toggleColorMode={mockToggleColorMode} />
    );
    
    expect(screen.getByTestId('toggle-color-mode')).toBeInTheDocument();
    expect(screen.getByText('Moon Icon')).toBeInTheDocument();
  });

  it('handles dark mode correctly', () => {
    renderWithTheme(
      <AppAppBar mode="dark" toggleColorMode={mockToggleColorMode} />
    );
    
    expect(screen.getByText('Sun Icon')).toBeInTheDocument();
  });

  it('shows profile menu in mobile view when user is authenticated', () => {
    Object.assign(mockAuthContext, {
      activeUser: { uid: 'test-user', email: 'test@example.com' },
      loading: false,
    });

    renderWithTheme(
      <AppAppBar mode="light" toggleColorMode={mockToggleColorMode} />
    );
    
    // Should show profile menu buttons in both desktop and mobile sections
    const profileMenuButtons = screen.getAllByTestId('profile-menu-button');
    expect(profileMenuButtons.length).toBeGreaterThan(0);
  });

  it('passes correct props to MobileNavigation', () => {
    Object.assign(mockAuthContext, {
      activeUser: { uid: 'test-user' },
      loading: false,
    });

    renderWithTheme(
      <AppAppBar mode="dark" toggleColorMode={mockToggleColorMode} />
    );
    
    expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
  });

  it('renders without errors when all dependencies are present', () => {
    Object.assign(mockAuthContext, {
      activeUser: { uid: 'test-user' },
      loading: false,
      db: {},
      app: {},
    });

    expect(() => {
      renderWithTheme(
        <AppAppBar mode="light" toggleColorMode={mockToggleColorMode} />
      );
    }).not.toThrow();
  });
});
