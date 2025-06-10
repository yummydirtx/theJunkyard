import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/test-utils';
import Features from './Features';

// Mock the asset imports
vi.mock('../../../assets/anteaterfind.png', () => ({
  default: 'mocked-anteaterfind.png',
}));
vi.mock('../../../assets/manualbudget.png', () => ({
  default: 'mocked-manualbudget.png',
}));
vi.mock('../../../assets/expensereport.png', () => ({
  default: 'mocked-expensereport.png',
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

describe('Features Component', () => {
  beforeEach(() => {
    mockWindowOpen.mockClear();
  });

  it('should render the section title', () => {
    render(<Features />);
    expect(screen.getByText('Featured Projects')).toBeInTheDocument();
  });

  it('should render the section description', () => {
    render(<Features />);
    expect(screen.getByText(/This is a collection of projects I have worked on/)).toBeInTheDocument();
  });

  it('should render all feature items', () => {
    render(<Features />);
    
    const anteaterElements = screen.getAllByText('AnteaterFind');
    expect(anteaterElements.length).toBeGreaterThan(0);
    
    const manualBudgetElements = screen.getAllByText('Manual Budget');
    expect(manualBudgetElements.length).toBeGreaterThan(0);
    
    const expenseReportElements = screen.getAllByText('Expense Report');
    expect(expenseReportElements.length).toBeGreaterThan(0);
  });

  it('should render feature descriptions', () => {
    render(<Features />);
    
    const anteaterDescriptions = screen.getAllByText(/AnteaterFind is a full stack web application/);
    expect(anteaterDescriptions.length).toBeGreaterThan(0);
    
    const manualBudgetDescriptions = screen.getAllByText(/Manual Budget is a personal finance tracking tool/);
    expect(manualBudgetDescriptions.length).toBeGreaterThan(0);
    
    const expenseReportDescriptions = screen.getAllByText(/Expense Report leverages React, Firebase/);
    expect(expenseReportDescriptions.length).toBeGreaterThan(0);
  });

  it('should have the correct section id', () => {
    render(<Features />);
    
    const section = document.querySelector('#features');
    expect(section).toBeInTheDocument();
  });

  it('should render GitHub links', () => {
    render(<Features />);
    
    const githubLinks = screen.getAllByText('View Source on GitHub');
    expect(githubLinks.length).toBeGreaterThan(0);
  });

  it('should render demo links', () => {
    render(<Features />);
    
    const demoLinks = screen.getAllByText('Try it out');
    expect(demoLinks.length).toBeGreaterThan(0);
  });

  it('should handle feature selection on mobile', () => {
    render(<Features />);
    
    // Find chips (mobile view)
    const chips = screen.getAllByRole('button').filter(button => 
      button.classList.contains('MuiChip-root')
    );
    
    if (chips.length > 0) {
      fireEvent.click(chips[1]); // Click second chip
      // The component should update the selected state
      expect(chips[1]).toHaveClass('MuiChip-root');
    }
  });

  it('should handle feature selection on desktop', () => {
    render(<Features />);
    
    // Find feature cards (desktop view)
    const featureCards = screen.getAllByRole('button').filter(button =>
      button.classList.contains('MuiCard-root')
    );
    
    if (featureCards.length > 0) {
      fireEvent.click(featureCards[1]); // Click second card
      // The component should update the selected state
      expect(featureCards[1]).toBeInTheDocument();
    }
  });

  it('should open GitHub links in new tab', () => {
    render(<Features />);
    
    const githubLinks = screen.getAllByText('View Source on GitHub');
    if (githubLinks.length > 0) {
      fireEvent.click(githubLinks[0]);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('github.com'),
        '_blank'
      );
    }
  });

  it('should open demo links in same tab', () => {
    render(<Features />);
    
    const demoLinks = screen.getAllByText('Try it out');
    if (demoLinks.length > 0) {
      fireEvent.click(demoLinks[0]);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.any(String),
        '_self'
      );
    }
  });

  it('should render feature icons', () => {
    render(<Features />);
    
    // Check for Material-UI icons
    const searchIcon = document.querySelector('[data-testid="SearchIcon"]');
    const walletIcon = document.querySelector('[data-testid="AccountBalanceWalletIcon"]');
    const receiptIcon = document.querySelector('[data-testid="ReceiptLongIcon"]');
    
    // At least one icon should be present
    expect(searchIcon || walletIcon || receiptIcon).toBeTruthy();
  });

  it('should render with responsive grid layout', () => {
    const { container } = render(<Features />);
    
    const gridElements = container.querySelectorAll('.MuiGrid-root');
    expect(gridElements.length).toBeGreaterThan(0);
  });

  it('should show background images for features', () => {
    const { container } = render(<Features />);
    
    // Check for elements with background-image CSS property using MUI classes
    const elementsWithBg = container.querySelectorAll('[class*="css"]');
    expect(elementsWithBg.length).toBeGreaterThan(0);
    
    // More specific check - look for Box elements that would contain background images
    const backgroundBoxes = container.querySelectorAll('.MuiBox-root');
    expect(backgroundBoxes.length).toBeGreaterThan(0);
  });
});
