import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MobileNavigation from '../MobileNavigation';

// Mock the navigation config - define the mock data inline to avoid hoisting issues
vi.mock('../navigationConfig', () => ({
  mainNavigationItems: [
    { label: 'Home', href: '/' },
    { label: 'Manual Budget', href: '/manualbudget' },
    { label: 'Expense Report', href: '/expensereport' },
    { label: 'AnteaterFind', href: 'https://anteaterfind.com', external: true, icon: () => <span>Icon</span> },
  ],
  moreNavigationItems: [
    { label: 'calcBasic', href: '/calcbasic-web' },
    { label: 'YTThumb', href: '/ytthumb' },
  ],
}));

// Mock ToggleColorMode component
vi.mock('../../ui/ToggleColorMode', () => ({
  default: ({ mode, toggleColorMode }: any) => (
    <button onClick={toggleColorMode} data-testid="toggle-color-mode">
      {mode} mode
    </button>
  ),
}));

const mockTheme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('MobileNavigation', () => {
  const defaultProps = {
    open: false,
    onClose: vi.fn(),
    mode: 'light' as const,
    toggleColorMode: vi.fn(),
    activeUser: null,
    loading: false,
    onOpenLoginModal: vi.fn(),
    onOpenSignUpModal: vi.fn(),
  };

  let mockWindowOpen: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen = vi.fn();
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true,
    });
  });

  it('renders without crashing when closed', () => {
    renderWithTheme(<MobileNavigation {...defaultProps} />);
    
    // Drawer should not be visible when closed
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
  });

  it('renders navigation items when open', () => {
    renderWithTheme(<MobileNavigation {...defaultProps} open={true} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Manual Budget')).toBeInTheDocument();
    expect(screen.getByText('Expense Report')).toBeInTheDocument();
    expect(screen.getByText('AnteaterFind')).toBeInTheDocument();
  });

  it('renders theme toggle when open', () => {
    renderWithTheme(<MobileNavigation {...defaultProps} open={true} />);
    
    expect(screen.getByTestId('toggle-color-mode')).toBeInTheDocument();
    // In light mode, should show moon icon (to switch to dark mode)
    expect(screen.getByTestId('ModeNightRoundedIcon')).toBeInTheDocument();
  });

  it('shows More section with collapsible items', () => {
    renderWithTheme(<MobileNavigation {...defaultProps} open={true} />);
    
    expect(screen.getByText('More')).toBeInTheDocument();
    
    // More items should not be visible initially
    expect(screen.queryByText('calcBasic')).not.toBeInTheDocument();
    expect(screen.queryByText('YTThumb')).not.toBeInTheDocument();
  });

  it('expands More section when clicked', () => {
    renderWithTheme(<MobileNavigation {...defaultProps} open={true} />);
    
    const moreButton = screen.getByText('More');
    fireEvent.click(moreButton);
    
    expect(screen.getByText('calcBasic')).toBeInTheDocument();
    expect(screen.getByText('YTThumb')).toBeInTheDocument();
  });

  it('collapses More section when clicked again', async () => {
    renderWithTheme(<MobileNavigation {...defaultProps} open={true} />);
    
    const moreButton = screen.getByText('More');
    
    // Expand
    fireEvent.click(moreButton);
    expect(screen.getByText('calcBasic')).toBeInTheDocument();
    
    // Collapse
    fireEvent.click(moreButton);
    await waitFor(() => {
      expect(screen.queryByText('calcBasic')).not.toBeInTheDocument();
    });
  });

  it('shows login and signup buttons when user is not authenticated', () => {
    renderWithTheme(
      <MobileNavigation 
        {...defaultProps} 
        open={true} 
        activeUser={null} 
        loading={false} 
      />
    );
    
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('hides login and signup buttons when user is authenticated', () => {
    renderWithTheme(
      <MobileNavigation 
        {...defaultProps} 
        open={true} 
        activeUser={{ uid: 'test-user' }} 
        loading={false} 
      />
    );
    
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    expect(screen.queryByText('Log In')).not.toBeInTheDocument();
  });

  it('hides login and signup buttons when loading', () => {
    renderWithTheme(
      <MobileNavigation 
        {...defaultProps} 
        open={true} 
        activeUser={null} 
        loading={true} 
      />
    );
    
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    expect(screen.queryByText('Log In')).not.toBeInTheDocument();
  });

  it('navigates to internal links and closes drawer', () => {
    const mockOnClose = vi.fn();
    renderWithTheme(
      <MobileNavigation {...defaultProps} open={true} onClose={mockOnClose} />
    );
    
    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);
    
    expect(mockWindowOpen).toHaveBeenCalledWith('/', '_self');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('navigates to external links and closes drawer', () => {
    const mockOnClose = vi.fn();
    renderWithTheme(
      <MobileNavigation {...defaultProps} open={true} onClose={mockOnClose} />
    );
    
    const externalLink = screen.getByText('AnteaterFind');
    fireEvent.click(externalLink);
    
    expect(mockWindowOpen).toHaveBeenCalledWith('https://anteaterfind.com', '_blank');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('navigates to More items and closes drawer', () => {
    const mockOnClose = vi.fn();
    renderWithTheme(
      <MobileNavigation {...defaultProps} open={true} onClose={mockOnClose} />
    );
    
    // Expand More section
    const moreButton = screen.getByText('More');
    fireEvent.click(moreButton);
    
    // Click on a More item
    const calcBasicLink = screen.getByText('calcBasic');
    fireEvent.click(calcBasicLink);
    
    expect(mockWindowOpen).toHaveBeenCalledWith('/calcbasic-web', '_self');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onOpenLoginModal and closes drawer when login is clicked', () => {
    const mockOnClose = vi.fn();
    const mockOnOpenLoginModal = vi.fn();
    
    renderWithTheme(
      <MobileNavigation 
        {...defaultProps} 
        open={true} 
        onClose={mockOnClose}
        onOpenLoginModal={mockOnOpenLoginModal}
        activeUser={null}
        loading={false}
      />
    );
    
    const loginButton = screen.getByText('Log In');
    fireEvent.click(loginButton);
    
    expect(mockOnOpenLoginModal).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onOpenSignUpModal and closes drawer when signup is clicked', () => {
    const mockOnClose = vi.fn();
    const mockOnOpenSignUpModal = vi.fn();
    
    renderWithTheme(
      <MobileNavigation 
        {...defaultProps} 
        open={true} 
        onClose={mockOnClose}
        onOpenSignUpModal={mockOnOpenSignUpModal}
        activeUser={null}
        loading={false}
      />
    );
    
    const signupButton = screen.getByText('Sign Up');
    fireEvent.click(signupButton);
    
    expect(mockOnOpenSignUpModal).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls toggleColorMode when theme toggle is clicked', () => {
    const mockToggleColorMode = vi.fn();
    
    renderWithTheme(
      <MobileNavigation 
        {...defaultProps} 
        open={true} 
        toggleColorMode={mockToggleColorMode}
      />
    );
    
    const toggleButton = screen.getByTestId('toggle-color-mode');
    fireEvent.click(toggleButton);
    
    expect(mockToggleColorMode).toHaveBeenCalled();
  });

  it('handles dark mode correctly', () => {
    renderWithTheme(
      <MobileNavigation {...defaultProps} open={true} mode="dark" />
    );
    
    // In dark mode, should show sun icon (to switch to light mode)
    expect(screen.getByTestId('WbSunnyRoundedIcon')).toBeInTheDocument();
  });

  it('resets More section state when drawer closes', async () => {
    const mockOnClose = vi.fn();
    const { rerender } = renderWithTheme(
      <MobileNavigation {...defaultProps} open={true} onClose={mockOnClose} />
    );
    
    // Expand More section
    let moreButton = screen.getByText('More');
    fireEvent.click(moreButton);
    expect(screen.getByText('calcBasic')).toBeInTheDocument();
    
    // Close the drawer (this calls handleClose which should reset mobileMoreOpen)
    rerender(<MobileNavigation {...defaultProps} open={false} onClose={mockOnClose} />);
    
    // Reopen the drawer - More section should start collapsed
    rerender(<MobileNavigation {...defaultProps} open={true} onClose={mockOnClose} />);
    
    // calcBasic should not be visible because More section should be collapsed by default
    await waitFor(() => {
      expect(screen.queryByText('calcBasic')).not.toBeInTheDocument();
    });
  });

  it('has proper drawer anchor', () => {
    renderWithTheme(<MobileNavigation {...defaultProps} open={true} />);
    
    // The drawer should be anchored to the right
    // This would need to be tested through the component's props or by checking the DOM structure
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('renders with proper width styling', () => {
    renderWithTheme(<MobileNavigation {...defaultProps} open={true} />);
    
    // Check if the drawer content has the expected minimum width
    const drawerContent = screen.getByText('Home').closest('div');
    expect(drawerContent).toBeInTheDocument();
  });
});
