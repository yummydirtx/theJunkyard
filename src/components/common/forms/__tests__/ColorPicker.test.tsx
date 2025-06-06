import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ColorPicker, { categoryColors } from '../ColorPicker';

// Mock Material-UI icons
vi.mock('@mui/icons-material/Circle', () => ({
  default: () => <div data-testid="circle-icon" />
}));

const mockTheme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('ColorPicker', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithTheme(
      <ColorPicker
        selectedColor="#FF5722"
        onChange={mockOnChange}
      />
    );
    expect(screen.getByText('Category Color')).toBeInTheDocument();
  });

  it('displays all predefined colors', () => {
    renderWithTheme(
      <ColorPicker
        selectedColor="#1976d2"
        onChange={mockOnChange}
      />
    );

    const colorButtons = screen.getAllByRole('button');
    // Should have predefined colors + 1 custom color button
    expect(colorButtons).toHaveLength(categoryColors.length + 1);
  });

  it('calls onChange when a color is selected', () => {
    renderWithTheme(
      <ColorPicker
        selectedColor="#1976d2"
        onChange={mockOnChange}
      />
    );

    const colorButtons = screen.getAllByRole('button');
    fireEvent.click(colorButtons[1]); // Click second predefined color

    expect(mockOnChange).toHaveBeenCalledWith(categoryColors[1].value);
  });

  it('highlights the selected color', () => {
    const selectedColor = categoryColors[1].value;
    renderWithTheme(
      <ColorPicker
        selectedColor={selectedColor}
        onChange={mockOnChange}
      />
    );

    const colorButtons = screen.getAllByRole('button');
    // The selected button should have a different border style
    expect(colorButtons[1]).toHaveStyle({ borderWidth: '3px' });
  });

  it('handles disabled state', () => {
    renderWithTheme(
      <ColorPicker
        selectedColor="#1976d2"
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const colorButtons = screen.getAllByRole('button');
    colorButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('handles undefined selectedColor', () => {
    renderWithTheme(
      <ColorPicker
        selectedColor=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Category Color')).toBeInTheDocument();
    // Should not crash and should render all colors
    const colorButtons = screen.getAllByRole('button');
    expect(colorButtons).toHaveLength(categoryColors.length + 1);
  });

  it('applies correct tooltip text for predefined colors', () => {
    renderWithTheme(
      <ColorPicker
        selectedColor="#1976d2"
        onChange={mockOnChange}
      />
    );

    const colorButtons = screen.getAllByRole('button');
    categoryColors.forEach((color, index) => {
      expect(colorButtons[index]).toHaveAttribute('aria-label', `Select ${color.name} color`);
    });
  });

  it('uses correct background colors for buttons', () => {
    renderWithTheme(
      <ColorPicker
        selectedColor="#1976d2"
        onChange={mockOnChange}
      />
    );

    const colorButtons = screen.getAllByRole('button');
    categoryColors.forEach((color, index) => {
      expect(colorButtons[index]).toHaveStyle({ backgroundColor: color.value });
    });
  });

  it('opens custom color picker when custom color button is clicked', () => {
    renderWithTheme(
      <ColorPicker
        selectedColor="#1976d2"
        onChange={mockOnChange}
      />
    );

    const colorButtons = screen.getAllByRole('button');
    const customColorButton = colorButtons[colorButtons.length - 1]; // Last button is custom color
    
    fireEvent.click(customColorButton);
    
    expect(screen.getByText('Custom Color')).toBeInTheDocument();
  });
});
