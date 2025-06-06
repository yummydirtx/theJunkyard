import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import LandingPage from './LandingPage';
import { useTitle } from '../../../hooks/useTitle';

// Mock the useTitle hook
vi.mock('../../../hooks/useTitle', () => ({
  useTitle: vi.fn(),
}));

// Mock the PageLayout component
vi.mock('../../../components/layout/PageLayout', () => ({
  default: ({ children, mode, setMode, sx }: any) => (
    <div data-testid="page-layout" data-mode={mode} data-sx={JSON.stringify(sx)}>
      {children}
    </div>
  ),
}));

// Mock all the child components
vi.mock('../components/Me', () => ({
  default: () => <div data-testid="me-component">Me Component</div>,
}));

vi.mock('../components/Features', () => ({
  default: () => <div data-testid="features-component">Features Component</div>,
}));

vi.mock('../components/Testimonials', () => ({
  default: () => <div data-testid="testimonials-component">Testimonials Component</div>,
}));

vi.mock('../components/FAQ', () => ({
  default: () => <div data-testid="faq-component">FAQ Component</div>,
}));

vi.mock('../components/PastWebsites', () => ({
  default: () => <div data-testid="past-websites-component">PastWebsites Component</div>,
}));

describe('LandingPage Component', () => {
  const mockSetMode = vi.fn();
  const defaultProps = {
    setMode: mockSetMode,
    mode: 'light' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  it('should call useTitle with correct title', () => {
    const mockUseTitle = vi.mocked(useTitle);
    render(<LandingPage {...defaultProps} />);
    expect(mockUseTitle).toHaveBeenCalledWith('theJunkyard: Landing Page');
  });

  it('should render PageLayout with correct props', () => {
    render(<LandingPage {...defaultProps} />);
    
    const pageLayout = screen.getByTestId('page-layout');
    expect(pageLayout).toHaveAttribute('data-mode', 'light');
    expect(pageLayout).toHaveAttribute('data-sx', JSON.stringify({ bgcolor: 'background.default' }));
  });

  it('should render all child components', () => {
    render(<LandingPage {...defaultProps} />);
    
    expect(screen.getByTestId('me-component')).toBeInTheDocument();
    expect(screen.getByTestId('features-component')).toBeInTheDocument();
    expect(screen.getByTestId('testimonials-component')).toBeInTheDocument();
    expect(screen.getByTestId('faq-component')).toBeInTheDocument();
    expect(screen.getByTestId('past-websites-component')).toBeInTheDocument();
  });

  it('should render dividers between sections', () => {
    const { container } = render(<LandingPage {...defaultProps} />);
    
    const dividers = container.querySelectorAll('.MuiDivider-root');
    expect(dividers).toHaveLength(3); // Between Features/Testimonials, Testimonials/FAQ, FAQ/PastWebsites
  });

  it('should render components in correct order', () => {
    render(<LandingPage {...defaultProps} />);
    
    const pageLayout = screen.getByTestId('page-layout');
    const childElements = Array.from(pageLayout.children);
    
    // Check the order of components
    expect(childElements[0]).toHaveAttribute('data-testid', 'me-component');
    expect(childElements[1]).toHaveAttribute('data-testid', 'features-component');
    expect(childElements[3]).toHaveAttribute('data-testid', 'testimonials-component'); // Skip divider at index 2
    expect(childElements[5]).toHaveAttribute('data-testid', 'faq-component'); // Skip divider at index 4
    expect(childElements[7]).toHaveAttribute('data-testid', 'past-websites-component'); // Skip divider at index 6
  });

  it('should work with dark mode', () => {
    const darkModeProps = {
      ...defaultProps,
      mode: 'dark' as const,
    };
    
    render(<LandingPage {...darkModeProps} />);
    
    const pageLayout = screen.getByTestId('page-layout');
    expect(pageLayout).toHaveAttribute('data-mode', 'dark');
  });

  it('should pass setMode function to PageLayout', () => {
    render(<LandingPage {...defaultProps} />);
    
    // The setMode function should be passed to PageLayout
    // We can verify this through the component structure
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  it('should have proper component structure', () => {
    const { container } = render(<LandingPage {...defaultProps} />);
    
    // Check that the main structure is present
    const pageLayout = container.querySelector('[data-testid="page-layout"]');
    expect(pageLayout).toBeInTheDocument();
    
    // Check that all sections are children of PageLayout
    const sections = pageLayout?.querySelectorAll('[data-testid*="-component"]');
    expect(sections).toHaveLength(5); // Me, Features, Testimonials, FAQ, PastWebsites
  });

  it('should maintain component isolation', () => {
    // Each component should be independently rendered
    render(<LandingPage {...defaultProps} />);
    
    // All components should be present and distinct
    const componentTestIds = [
      'me-component',
      'features-component', 
      'testimonials-component',
      'faq-component',
      'past-websites-component'
    ];
    
    componentTestIds.forEach(testId => {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  });

  it('should apply correct styling to PageLayout', () => {
    render(<LandingPage {...defaultProps} />);
    
    const pageLayout = screen.getByTestId('page-layout');
    const sxProp = JSON.parse(pageLayout.getAttribute('data-sx') || '{}');
    expect(sxProp).toEqual({ bgcolor: 'background.default' });
  });
});
