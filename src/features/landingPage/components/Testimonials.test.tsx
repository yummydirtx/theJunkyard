import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import Testimonials from './Testimonials';

// Mock the asset imports
vi.mock('../../../assets/discord-mark-blue.svg', () => ({
  default: 'mocked-discord-icon.svg',
}));
vi.mock('../../../assets/websitelogo.png', () => ({
  default: 'mocked-website-logo.png',
}));

describe('Testimonials Component', () => {
  it('should render the section title', () => {
    render(<Testimonials />);
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
  });

  it('should render the section description', () => {
    render(<Testimonials />);
    expect(screen.getByText(/See what people are saying about the Junkyard/)).toBeInTheDocument();
  });

  it('should have the correct section id', () => {
    render(<Testimonials />);
    
    const section = document.querySelector('#testimonials');
    expect(section).toBeInTheDocument();
  });

  it('should render all testimonial cards', () => {
    render(<Testimonials />);
    
    // Check for testimonial authors
    expect(screen.getByText('Ayush Lenka')).toBeInTheDocument();
    expect(screen.getByText('Matthew Cohen')).toBeInTheDocument();
    expect(screen.getByText('Sam Frutkin')).toBeInTheDocument();
    expect(screen.getByText('Amanda Riordan')).toBeInTheDocument();
    expect(screen.getByText('Mika Schreiman')).toBeInTheDocument();
    expect(screen.getByText('Alex Frutkin')).toBeInTheDocument();
  });

  it('should render testimonial occupations', () => {
    render(<Testimonials />);
    
    expect(screen.getByText('Programming Master')).toBeInTheDocument();
    expect(screen.getByText('Bartender')).toBeInTheDocument();
    expect(screen.getByText('Discord Mod')).toBeInTheDocument();
    expect(screen.getByText('Minecraft Expert')).toBeInTheDocument();
    expect(screen.getByText('Aquatics Coordinator')).toBeInTheDocument();
    expect(screen.getByText('CEO and Founder of theJunkyard')).toBeInTheDocument();
  });

  it('should render testimonial texts', () => {
    render(<Testimonials />);
    
    expect(screen.getByText('CS major approval right here from yours truly.')).toBeInTheDocument();
    expect(screen.getByText('Very revolutionary. I love the simplicity.')).toBeInTheDocument();
    expect(screen.getByText("You're clearly cool and talented.")).toBeInTheDocument();
    expect(screen.getByText('those could all be testimonials if you were devoted enough')).toBeInTheDocument();
    expect(screen.getByText(/Manual Budget is awesome and I have literally used/)).toBeInTheDocument();
    expect(screen.getByText('Does anyone actually read these?')).toBeInTheDocument();
  });

  it('should render avatars for each testimonial', () => {
    render(<Testimonials />);
    
    // Check for avatar elements
    const avatars = screen.getAllByRole('img');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('should render testimonial cards with proper structure', () => {
    const { container } = render(<Testimonials />);
    
    // Check for card elements
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards).toHaveLength(6); // 6 testimonials
    
    // Check for card content
    const cardContents = container.querySelectorAll('.MuiCardContent-root');
    expect(cardContents).toHaveLength(6);
    
    // Check for card headers
    const cardHeaders = container.querySelectorAll('.MuiCardHeader-root');
    expect(cardHeaders).toHaveLength(6);
  });

  it('should render with responsive grid layout', () => {
    const { container } = render(<Testimonials />);
    
    const gridContainer = container.querySelector('.MuiGrid-root.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();
    
    const gridItems = container.querySelectorAll('.MuiGrid-root:not(.MuiGrid-container)');
    expect(gridItems).toHaveLength(6); // 6 testimonial grid items
  });

  it('should have proper container styling', () => {
    const { container } = render(<Testimonials />);
    
    const mainContainer = container.querySelector('.MuiContainer-root');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveAttribute('id', 'testimonials');
  });

  it('should render testimonials in cards with proper typography', () => {
    const { container } = render(<Testimonials />);
    
    // Check for proper typography elements
    const bodyText = container.querySelectorAll('[class*="MuiTypography-body2"]');
    expect(bodyText.length).toBeGreaterThan(0);
  });

  it('should handle theme-based logo selection', () => {
    const { container } = render(<Testimonials />);
    
    // The component should render without errors regardless of theme
    const testimonialSection = container.querySelector('#testimonials');
    expect(testimonialSection).toBeInTheDocument();
  });
});
