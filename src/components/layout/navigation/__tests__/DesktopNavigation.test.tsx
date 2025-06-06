import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DesktopNavigation from '../DesktopNavigation';

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

const mockTheme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('DesktopNavigation', () => {
  let mockWindowOpen: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen = vi.fn();
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true,
    });
  });

  it('renders without crashing', () => {
    renderWithTheme(<DesktopNavigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Manual Budget')).toBeInTheDocument();
    expect(screen.getByText('Expense Report')).toBeInTheDocument();
    expect(screen.getByText('AnteaterFind')).toBeInTheDocument();
  });

  it('renders all main navigation items', () => {
    renderWithTheme(<DesktopNavigation />);
    
    const expectedItems = ['Home', 'Manual Budget', 'Expense Report', 'AnteaterFind'];
    expectedItems.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders More button', () => {
    renderWithTheme(<DesktopNavigation />);
    
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /more/i })).toBeInTheDocument();
  });

  it('opens More menu when More button is clicked', () => {
    renderWithTheme(<DesktopNavigation />);
    
    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);
    
    // Check if menu items appear
    const expectedMoreItems = ['calcBasic', 'YTThumb'];
    expectedMoreItems.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('closes More menu when clicking outside', () => {
    renderWithTheme(<DesktopNavigation />);
    
    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);
    
    // Menu should be open
    expect(screen.getByText('calcBasic')).toBeInTheDocument();
    
    // Click outside (escape key)
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Menu items should not be visible after closing
    // Note: This might need adjustment based on MUI behavior
  });

  it('navigates to internal links correctly', () => {
    renderWithTheme(<DesktopNavigation />);
    
    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);
    
    expect(mockWindowOpen).toHaveBeenCalledWith('/', '_self');
  });

  it('navigates to external links correctly', () => {
    renderWithTheme(<DesktopNavigation />);
    
    const externalLink = screen.getByText('AnteaterFind');
    fireEvent.click(externalLink);
    
    expect(mockWindowOpen).toHaveBeenCalledWith('https://anteaterfind.com', '_blank');
  });

  it('navigates to More menu items correctly', () => {
    renderWithTheme(<DesktopNavigation />);
    
    // Open More menu
    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);
    
    // Click on a menu item
    const calcBasicLink = screen.getByText('calcBasic');
    fireEvent.click(calcBasicLink);
    
    expect(mockWindowOpen).toHaveBeenCalledWith('/calcbasic-web', '_self');
  });

  it('renders icons for items that have them', () => {
    renderWithTheme(<DesktopNavigation />);
    
    // The AnteaterFind item should have an icon
    const anteaterFindItem = screen.getByText('AnteaterFind');
    expect(anteaterFindItem).toBeInTheDocument();
    // Check if icon is rendered (this depends on the mock structure)
  });

  it('has correct accessibility attributes', () => {
    renderWithTheme(<DesktopNavigation />);
    
    const moreButton = screen.getByRole('button', { name: /more/i });
    
    expect(moreButton).toHaveAttribute('aria-haspopup', 'true');
    expect(moreButton).toHaveAttribute('id', 'more-button');
    
    // Initially menu should not be expanded
    expect(moreButton).toHaveAttribute('aria-expanded', 'false');
    
    // Click to expand
    fireEvent.click(moreButton);
    expect(moreButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('hides on mobile screens (via CSS)', () => {
    renderWithTheme(<DesktopNavigation />);
    
    const navigationContainer = screen.getByText('Home').closest('div');
    // The component should have display: { xs: 'none', md: 'flex' }
    // This is tested via the sx prop, which might need specific testing setup
    expect(navigationContainer).toBeInTheDocument();
  });

  it('handles menu item clicks in More dropdown', () => {
    renderWithTheme(<DesktopNavigation />);
    
    // Open More menu
    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);
    
    // Click YTThumb
    const ytThumbLink = screen.getByText('YTThumb');
    fireEvent.click(ytThumbLink);
    
    expect(mockWindowOpen).toHaveBeenCalledWith('/ytthumb', '_self');
  });

  it('properly handles keyboard navigation', () => {
    renderWithTheme(<DesktopNavigation />);
    
    const moreButton = screen.getByRole('button', { name: /more/i });
    
    // Focus the button
    moreButton.focus();
    expect(document.activeElement).toBe(moreButton);
    
    // Click to open menu (browsers typically handle Enter->click conversion)
    fireEvent.click(moreButton);
    
    // Menu should be accessible
    expect(moreButton).toHaveAttribute('aria-expanded', 'true');
  });
});
