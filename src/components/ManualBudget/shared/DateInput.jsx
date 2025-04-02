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

import { forwardRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const DateInput = forwardRef(({ 
    value, 
    onChange, 
    label = "Date", 
    required = false,
    disabled = false,
    mode = 'light',
    onCalendarClick,
    fullWidth = true,
    ...props 
}, ref) => {
    
    const handleCalendarClick = () => {
        if (ref && ref.current) {
            // Try to open the native date picker using multiple methods
            ref.current.focus();

            // For modern browsers that support showPicker
            if (typeof ref.current.showPicker === 'function') {
                ref.current.showPicker();
            } else {
                // Fallback - simulate click on the input
                ref.current.click();
            }
        }
        
        // Call the onCalendarClick prop if provided
        if (onCalendarClick) {
            onCalendarClick();
        }
    };

    return (
        <TextField
            fullWidth={fullWidth}
            label={label}
            type="date"
            variant="outlined"
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            inputRef={ref}
            sx={{
                '& input[type="date"]::-webkit-calendar-picker-indicator': {
                    display: 'none' // Hide default calendar icon
                }
            }}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <CalendarTodayIcon
                            sx={{
                                color: mode === 'light' ? 'black' : 'white',
                                cursor: 'pointer'
                            }}
                            onClick={handleCalendarClick}
                        />
                    </InputAdornment>
                ),
            }}
            InputLabelProps={{
                shrink: true,
            }}
            {...props}
        />
    );
});

export default DateInput;
