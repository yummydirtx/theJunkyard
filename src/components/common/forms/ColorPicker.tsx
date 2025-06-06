// Copyright (c) 2025 Alex Frutkin
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (theJunkyard), to deal in
// theJunkyard without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// theJunkyard, and to permit persons to whom theJunkyard is furnished to do so,
// subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of theJunkyard.
// 
// THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Tooltip,
    Popover
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';

/**
 * Interface for a category color option.
 */
export interface CategoryColor {
    /** The display name of the color. */
    name: string;
    /** The hex value of the color. */
    value: string;
}

/**
 * A predefined array of color options for budget categories.
 */
export const categoryColors: CategoryColor[] = [
    { name: 'Blue', value: '#1976d2' },
    { name: 'Green', value: '#2e7d32' },
    { name: 'Red', value: '#d32f2f' },
    { name: 'Purple', value: '#7b1fa2' },
    { name: 'Orange', value: '#ed6c02' },
    { name: 'Teal', value: '#0d7377' },
    { name: 'Pink', value: '#c2185b' },
    { name: 'Gray', value: '#757575' },
    { name: 'Amber', value: '#ff8f00' },
];

/**
 * Props for the ColorPicker component.
 */
interface ColorPickerProps {
    /** The currently selected hex color value. */
    selectedColor: string;
    /** Callback function invoked when a color is selected. Receives the new hex color value. */
    onChange: (color: string) => void;
    /** If true, the color picker is disabled. */
    disabled?: boolean;
}

/**
 * ColorPicker component allows users to select a color from a predefined palette
 * or choose a custom color using a hex color picker.
 */
export default function ColorPicker({ selectedColor, onChange, disabled = false }: ColorPickerProps) {
    /** Anchor element for the custom color picker popover. */
    const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);

    /**
     * Handles selection of a predefined color.
     * @param color - The hex value of the selected predefined color.
     */
    const handleColorSelect = (color: string): void => {
        onChange(color);
    };

    /**
     * Opens the custom color picker popover.
     * @param event - The click event.
     */
    const handleOpenColorPicker = (event: React.MouseEvent<HTMLElement>): void => {
        setColorPickerAnchor(event.currentTarget);
    };

    /**
     * Closes the custom color picker popover.
     */
    const handleCloseColorPicker = (): void => {
        setColorPickerAnchor(null);
    };

    /**
     * Handles selection of a color from the custom hex color picker.
     * @param color - The hex value of the selected custom color.
     */
    const handleCustomColorSelect = (color: string): void => {
        onChange(color);
    };

    return (
        <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
                Category Color
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categoryColors.map((color) => (
                    <Tooltip key={color.value} title={color.name}>
                        <span>
                            <Button
                                sx={{
                                    bgcolor: color.value,
                                    minWidth: '36px',
                                    height: '36px',
                                    p: 0,
                                    borderRadius: '50%',
                                    border: selectedColor === color.value ? '3px solid #000' : 'none',
                                    '&:hover': {
                                        bgcolor: color.value,
                                        opacity: 0.8,
                                    }
                                }}
                                onClick={() => handleColorSelect(color.value)}
                                disabled={disabled}
                                aria-label={`Select ${color.name} color`}
                            />
                        </span>
                    </Tooltip>
                ))}
                <Tooltip title="Custom Color">
                    <span>
                        <Button
                            sx={{
                                minWidth: '36px',
                                height: '36px',
                                p: 0,
                                borderRadius: '50%',
                                border: !categoryColors.some(c => c.value === selectedColor) ? '3px solid #000' : 'none',
                                background: 'linear-gradient(135deg, #ff5722 0%, #2196f3 50%, #4caf50 100%)',
                                '&:hover': {
                                    opacity: 0.8,
                                }
                            }}
                            onClick={handleOpenColorPicker}
                            disabled={disabled}
                            aria-label="Select custom color"
                        />
                    </span>
                </Tooltip>
            </Box>
            
            <Popover
                open={Boolean(colorPickerAnchor)}
                anchorEl={colorPickerAnchor}
                onClose={handleCloseColorPicker}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Custom Color
                    </Typography>
                    <HexColorPicker 
                        color={selectedColor} 
                        onChange={handleCustomColorSelect}
                    />
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                bgcolor: selectedColor,
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                mr: 1
                            }}
                        />
                        <Typography variant="body2">
                            {selectedColor}
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            size="small" 
                            onClick={handleCloseColorPicker}
                            sx={{ mr: 1 }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            size="small" 
                            variant="contained"
                            onClick={handleCloseColorPicker}
                        >
                            Done
                        </Button>
                    </Box>
                </Box>
            </Popover>
        </Box>
    );
}
