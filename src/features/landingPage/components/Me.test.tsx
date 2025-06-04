import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import Me from './Me';

// Mock the profile image
vi.mock('../../../assets/profilepic.jpeg', () => ({
  default: 'mocked-profile-pic.jpg',
}));

describe('Me Component', () => {
  it('should render the welcome message', () => {
    render(<Me />);
    
    const welcomeElements = screen.getAllByText('Welcome to the Junkyard');
    expect(welcomeElements.length).toBeGreaterThan(0);
    expect(welcomeElements[0]).toBeInTheDocument();
  });

  it('should render the introduction text', () => {
    render(<Me />);
    
    expect(screen.getByText("Hi, I'm Alex Frutkin.")).toBeInTheDocument();
  });

  it('should render the description text', () => {
    render(<Me />);
    
    const description = screen.getByText(/I'm a student at the University of California, Irvine/);
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('studying Software Engineering');
    expect(description).toHaveTextContent('seeking internships for Summer 2025');
  });

  it('should render the profile picture', () => {
    render(<Me />);
    
    const profilePic = screen.getByRole('img');
    expect(profilePic).toBeInTheDocument();
    expect(profilePic).toHaveAttribute('src', 'mocked-profile-pic.jpg');
    expect(profilePic).toHaveAttribute('id', 'profilepic');
  });

  it('should have the correct section id', () => {
    render(<Me />);
    
    const section = document.querySelector('#me');
    expect(section).toBeInTheDocument();
  });

  it('should render a divider', () => {
    const { container } = render(<Me />);
    
    const divider = container.querySelector('.MuiDivider-root');
    expect(divider).toBeInTheDocument();
  });

  it('should have responsive typography for mobile and desktop', () => {
    render(<Me />);
    
    // Check for both mobile (h2) and desktop (h1) welcome messages
    const welcomeElements = screen.getAllByText('Welcome to the Junkyard');
    expect(welcomeElements).toHaveLength(2); // One hidden on mobile, one hidden on desktop
  });

  it('should render with proper structure', () => {
    const { container } = render(<Me />);
    
    // Check for main container structure
    const containerElement = container.querySelector('.MuiContainer-root');
    expect(containerElement).toBeInTheDocument();
    
    // Check for stack layout
    const stackElement = container.querySelector('.MuiStack-root');
    expect(stackElement).toBeInTheDocument();
  });
});
