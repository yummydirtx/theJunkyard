import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import PageLayout from '../PageLayout';

// Mock the child components
vi.mock('../AppAppBar', () => ({
  default: () => <div data-testid="app-bar">App Bar</div>
}));

vi.mock('../Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

const mockTheme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={mockTheme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('PageLayout', () => {
  const mockSetMode = vi.fn();
  const defaultProps = {
    mode: 'light' as const,
    setMode: mockSetMode
  };

  it('renders without crashing', () => {
    renderWithProviders(
      <PageLayout {...defaultProps}>
        <div>Test Content</div>
      </PageLayout>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders AppAppBar component', () => {
    renderWithProviders(
      <PageLayout {...defaultProps}>
        <div>Test Content</div>
      </PageLayout>
    );
    
    expect(screen.getByTestId('app-bar')).toBeInTheDocument();
  });

  it('renders Footer component', () => {
    renderWithProviders(
      <PageLayout {...defaultProps}>
        <div>Test Content</div>
      </PageLayout>
    );
    
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderWithProviders(
      <PageLayout {...defaultProps}>
        <div>Custom Content</div>
        <p>Additional paragraph</p>
      </PageLayout>
    );
    
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
    expect(screen.getByText('Additional paragraph')).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    renderWithProviders(
      <PageLayout {...defaultProps}>
        <div data-testid="main-content">Main Content</div>
      </PageLayout>
    );
    
    const container = screen.getByTestId('app-bar').parentElement;
    expect(container).toContainElement(screen.getByTestId('app-bar'));
    expect(container).toContainElement(screen.getByTestId('main-content'));
    expect(container).toContainElement(screen.getByTestId('footer'));
  });

  it('applies Box component styling', () => {
    renderWithProviders(
      <PageLayout {...defaultProps}>
        <div data-testid="test-content">Test Content</div>
      </PageLayout>
    );
    
    // The Box component should contain the children, not the app bar
    const testContent = screen.getByTestId('test-content');
    const container = testContent.parentElement;
    expect(container).toHaveClass('MuiBox-root');
  });

  it('handles empty children', () => {
    renderWithProviders(<PageLayout {...defaultProps}>{null}</PageLayout>);
    
    expect(screen.getByTestId('app-bar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('handles multiple child elements', () => {
    renderWithProviders(
      <PageLayout {...defaultProps}>
        <header>Header</header>
        <main>Main</main>
        <aside>Sidebar</aside>
      </PageLayout>
    );
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('maintains proper order of components', () => {
    const { container } = renderWithProviders(
      <PageLayout {...defaultProps}>
        <div data-testid="content">Content</div>
      </PageLayout>
    );
    
    const elements = container.querySelectorAll('[data-testid]');
    expect(elements[0]).toHaveAttribute('data-testid', 'app-bar');
    expect(elements[1]).toHaveAttribute('data-testid', 'content');
    expect(elements[2]).toHaveAttribute('data-testid', 'footer');
  });

  it('supports complex nested content', () => {
    renderWithProviders(
      <PageLayout {...defaultProps}>
        <div>
          <h1>Title</h1>
          <section>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </section>
        </div>
      </PageLayout>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
  });
});
