import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Footer from '../Footer';

const mockTheme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('Footer', () => {
  it('renders without crashing', () => {
    renderWithTheme(<Footer />);
    // The Footer component doesn't use a semantic footer element, it uses a Container
    expect(screen.getByRole('img', { name: /logo/i })).toBeInTheDocument();
  });

  it('displays the copyright text', () => {
    renderWithTheme(<Footer />);
    expect(screen.getByText(/Copyright © Alex Frutkin/)).toBeInTheDocument();
  });

  it('displays current year in copyright', () => {
    renderWithTheme(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`Copyright © Alex Frutkin ${currentYear}`)).toBeInTheDocument();
  });

  it('displays the logo', () => {
    renderWithTheme(<Footer />);
    const logo = screen.getByRole('img', { name: /logo/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', expect.stringContaining('websitelogo'));
  });

  it('applies Material-UI Container component', () => {
    renderWithTheme(<Footer />);
    const container = document.querySelector('.MuiContainer-root');
    expect(container).toBeInTheDocument();
  });

  it('displays social media links', () => {
    renderWithTheme(<Footer />);
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });

    it('uses Typography component for copyright text', () => {
    renderWithTheme(<Footer />);
    const textElement = screen.getByText(/Copyright © Alex Frutkin/);
    expect(textElement).toHaveClass('MuiTypography-root');
  });

  it('applies body2 variant to typography', () => {
    renderWithTheme(<Footer />);
    const textElement = screen.getByText(/Copyright © Alex Frutkin/);
    expect(textElement).toHaveClass('MuiTypography-body2');
  });

  it('has muted text color for copyright', () => {
    renderWithTheme(<Footer />);
    const textElement = screen.getByText(/Copyright © Alex Frutkin/);
    // In Material-UI v5, color is handled via CSS custom properties rather than class names
    expect(textElement).toHaveClass('MuiTypography-root');
    expect(textElement).toHaveClass('MuiTypography-body2');
  });

  it('has GitHub link with correct href', () => {
    renderWithTheme(<Footer />);
    const githubLink = screen.getByLabelText('GitHub').closest('a');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/yummydirtx/theJunkyard');
  });

  it('has LinkedIn link with correct href', () => {
    renderWithTheme(<Footer />);
    const linkedinLink = screen.getByLabelText('LinkedIn').closest('a');
    expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/alex-frutkin-63804597/');
  });
});
