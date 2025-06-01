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

import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    Tooltip,
    Popover
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';

/**
 * @typedef {object} CategoryColor
 * @property {string} name - The display name of the color.
 * @property {string} value - The hex value of the color.
 */

/**
 * A predefined array of color options for budget categories.
 * @type {Array<CategoryColor>}
 */
export const categoryColors = [
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
 * ColorPicker component allows users to select a color from a predefined palette
 * or choose a custom color using a hex color picker.
 * @param {object} props - The component's props.
 * @param {string} props.selectedColor - The currently selected hex color value.
 * @param {function} props.onChange - Callback function invoked when a color is selected. Receives the new hex color value.
 * @param {boolean} [props.disabled=false] - If true, the color picker is disabled.
 */
export default function ColorPicker({ selectedColor, onChange, disabled = false }) {
    /** @state {HTMLElement|null} colorPickerAnchor - Anchor element for the custom color picker popover. */
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null);

    /**
     * Handles selection of a predefined color.
     * @param {string} color - The hex value of the selected predefined color.
     */
    const handleColorSelect = (color) => {
        onChange(color);
    };

    /**
     * Opens the custom color picker popover.
     * @param {React.MouseEvent<HTMLElement>} event - The click event.
     */
    const handleOpenColorPicker = (event) => {
        setColorPickerAnchor(event.currentTarget);
    };

    /**
     * Closes the custom color picker popover.
     */
    const handleCloseColorPicker = () => {
        setColorPickerAnchor(null);
    };

    /**
     * Handles selection of a color from the custom hex color picker.
     * @param {string} color - The hex value of the selected custom color.
     */
    const handleCustomColorSelect = (color) => {
        onChange(color);
    };

    return (
        <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
                Category Color
            </Typography>
            <Grid container spacing={1}>
                {categoryColors.map((color) => (
                    <Grid item key={color.value}>
                        <Tooltip title={color.name}>
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
                        </Tooltip>
                    </Grid>
                ))}
                <Grid item>
                    <Tooltip title="Custom Color">
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
                    </Tooltip>
                </Grid>
            </Grid>
            
            <Popover
                open={Boolean(colorPickerAnchor)}
                anchorEl={colorPickerAnchor}
                onClose={handleCloseColorPicker}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                marginThreshold={16}
                disablePortal={false}
                slotProps={{
                    paper: {
                        sx: {
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }
                    }
                }}
            >
                <Box sx={{ 
                    p: { xs: 1, sm: 2 },
                    width: { xs: '240px', sm: '316px' }
                }}>
                    <HexColorPicker 
                        color={selectedColor} 
                        onChange={handleCustomColorSelect}
                        style={{ 
                            width: '100%', 
                            height: '200px' // Set explicit height instead of auto
                        }} 
                    />
                    <Box 
                        sx={{ 
                            mt: 2, 
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    >
                        <Button 
                            variant="contained" 
                            onClick={handleCloseColorPicker}
                            sx={{ 
                                bgcolor: selectedColor,
                                '&:hover': {
                                    bgcolor: selectedColor,
                                    opacity: 0.8,
                                }
                            }}
                        >
                            Select
                        </Button>
                    </Box>
                </Box>
            </Popover>
        </Box>
    );
}
