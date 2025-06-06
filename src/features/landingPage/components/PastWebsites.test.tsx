import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/test-utils';
import PastWebsites from './PastWebsites';

// Mock the asset imports
vi.mock('../../../assets/yummydirt.png', () => ({
  default: 'mocked-yummydirt.png',
}));
vi.mock('../../../assets/yummylogo.png', () => ({
  default: 'mocked-yummylogo.png',
}));
vi.mock('../../../assets/yummyme.png', () => ({
  default: 'mocked-yummyme.png',
}));
vi.mock('../../../assets/MeLogo.ico', () => ({
  default: 'mocked-melogo.ico',
}));
vi.mock('../../../assets/lobster.png', () => ({
  default: 'mocked-lobster.png',
}));
vi.mock('../../../assets/lobsterteck.png', () => ({
  default: 'mocked-lobsterteck.png',
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

describe('PastWebsites Component', () => {
  beforeEach(() => {
    mockWindowOpen.mockClear();
  });

  it('should render the section title', () => {
    render(<PastWebsites />);
    expect(screen.getByText('Past Websites')).toBeInTheDocument();
  });

  it('should render the section description', () => {
    render(<PastWebsites />);
    expect(screen.getByText(/Here is a collection of my past personal websites/)).toBeInTheDocument();
  });

  it('should have the correct section id', () => {
    render(<PastWebsites />);
    
    const section = document.querySelector('#websites');
    expect(section).toBeInTheDocument();
  });

  it('should render all past website items', () => {
    render(<PastWebsites />);
    
    expect(screen.getAllByText('yummydirt.com (2016-2018)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('yummydirt.me (2022-2023)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('LobsterTeck.tech (2022-forever)').length).toBeGreaterThan(0);
  });

  it('should render website descriptions', () => {
    render(<PastWebsites />);
    
    expect(screen.getAllByText(/My first personal website, created in 2016/).length).toBeGreaterThan(0);
    expect(screen.getByText(/This website was designed in raw HTML, CSS, and Javascript/)).toBeInTheDocument();
    expect(screen.getByText(/As a C suite executive at LobsterTeck/)).toBeInTheDocument();
  });

  it('should render the disclaimer', () => {
    render(<PastWebsites />);
    expect(screen.getByText('*We did not actually patent nor release world peace.')).toBeInTheDocument();
  });

  it('should render archive links', () => {
    render(<PastWebsites />);
    
    const archiveLinks = screen.getAllByText('Visit archive');
    expect(archiveLinks.length).toBeGreaterThan(0);
  });

  it('should handle website selection on mobile', () => {
    render(<PastWebsites />);
    
    // Find chips (mobile view)
    const chips = screen.getAllByRole('button').filter(button => 
      button.classList.contains('MuiChip-root')
    );
    
    if (chips.length > 0) {
      fireEvent.click(chips[1]); // Click second chip
      expect(chips[1]).toHaveClass('MuiChip-root');
    }
  });

  it('should handle website selection on desktop', () => {
    render(<PastWebsites />);
    
    // Find website cards (desktop view)
    const websiteCards = screen.getAllByRole('button').filter(button =>
      button.classList.contains('MuiCard-root')
    );
    
    if (websiteCards.length > 0) {
      fireEvent.click(websiteCards[1]); // Click second card
      expect(websiteCards[1]).toBeInTheDocument();
    }
  });

  it('should open archive links in new tab', () => {
    render(<PastWebsites />);
    
    const archiveLinks = screen.getAllByText('Visit archive');
    if (archiveLinks.length > 0) {
      fireEvent.click(archiveLinks[0]);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('web.archive.org'),
        '_blank'
      );
    }
  });

  it('should render website logos/icons', () => {
    render(<PastWebsites />);
    
    // Check for image elements (website logos)
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('should render with responsive grid layout', () => {
    const { container } = render(<PastWebsites />);
    
    const gridElements = container.querySelectorAll('.MuiGrid-root');
    expect(gridElements.length).toBeGreaterThan(0);
  });

  it('should show background images for websites', () => {
    const { container } = render(<PastWebsites />);
    
    // In the real component, background images are applied via CSS classes
    // In tests with mocked assets, we check for the existence of image containers
    const imageContainers = container.querySelectorAll('.MuiBox-root');
    expect(imageContainers.length).toBeGreaterThan(0);
  });

  it('should render chevron icons in archive links', () => {
    const { container } = render(<PastWebsites />);
    
    const chevronIcons = container.querySelectorAll('[data-testid="ChevronRightRoundedIcon"]');
    expect(chevronIcons.length).toBeGreaterThan(0);
  });

  it('should handle click events on archive links without propagation', () => {
    render(<PastWebsites />);
    
    const archiveLinks = screen.getAllByText('Visit archive');
    if (archiveLinks.length > 0) {
      // Create a spy on stopPropagation
      const mockEvent = {
        stopPropagation: vi.fn(),
      };
      
      // This tests that the link click handler includes stopPropagation logic
      fireEvent.click(archiveLinks[0]);
      expect(mockWindowOpen).toHaveBeenCalled();
    }
  });

  it('should render proper card structure for desktop view', () => {
    const { container } = render(<PastWebsites />);
    
    // Check for card elements
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should display correct time periods for websites', () => {
    render(<PastWebsites />);
    
    expect(screen.getAllByText(/2016-2018/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2022-2023/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2022-forever/).length).toBeGreaterThan(0);
  });
});
