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

import { forwardRef, useState, useEffect, useRef } from 'react';
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
    // Create our own reference if none is provided
    const innerRef = useRef(null);
    const actualRef = ref || innerRef;
    
    // Create a formatted display value from the date value
    const [displayValue, setDisplayValue] = useState('');
    
    // Update display value when the actual value changes
    useEffect(() => {
        if (value) {
            // Format the date value for display (YYYY-MM-DD → MM/DD/YYYY or your preferred format)
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
                const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                const day = dateObj.getDate().toString().padStart(2, '0');
                const year = dateObj.getFullYear();
                setDisplayValue(`${month}/${day}/${year}`);
            } else {
                setDisplayValue(value); // Fallback to original value if parsing fails
            }
        } else {
            setDisplayValue('');
        }
    }, [value]);
    
    const handleCalendarClick = () => {
        if (actualRef && actualRef.current) {
            // Focus and attempt to open the native date picker
            actualRef.current.focus();
            
            // For modern browsers that support showPicker
            if (typeof actualRef.current.showPicker === 'function') {
                actualRef.current.showPicker();
            } else {
                // Fallback - simulate click on the input
                actualRef.current.click();
            }
        }
        
        // Call the onCalendarClick prop if provided
        if (onCalendarClick) {
            onCalendarClick();
        }
    };

    // Handle changes from the hidden date input
    const handleDateChange = (e) => {
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div style={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
            {/* Visible styled text input */}
            <TextField
                fullWidth={fullWidth}
                label={label}
                variant="outlined"
                value={displayValue}
                required={required}
                disabled={disabled}
                onClick={handleCalendarClick} // Open calendar when clicking anywhere in the field
                slotProps={{
                    input: {
                        readOnly: true, // Make the visible input read-only
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
                    },
                    inputLabel: {
                        shrink: true,
                    }
                }}
                {...props}
            />
            
            {/* Hidden actual date input for functionality */}
            <input
                type="date"
                ref={actualRef}
                value={value || ''}
                onChange={handleDateChange}
                required={required}
                disabled={disabled}
                style={{
                    opacity: 0,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                }}
                {...props}
            />
        </div>
    );
});

export default DateInput;
