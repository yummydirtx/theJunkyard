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

// A custom date input component that overlays a native date picker over a styled TextField.
const DateInput = forwardRef(({ 
    value,          // The date value in 'YYYY-MM-DD' format
    onChange,       // Callback function when the date changes
    label = "Date", 
    required = false,
    disabled = false,
    mode = 'light', // Theme mode for icon color
    onCalendarClick,// Optional callback for calendar icon click
    fullWidth = true,
    ...props        // Other TextField props
}, ref) => {
    // Use internal ref if no external ref is provided
    const innerRef = useRef(null);
    const actualRef = ref || innerRef; // This ref points to the hidden native input
    
    // State to hold the formatted date string for display (e.g., MM/DD/YYYY)
    const [displayValue, setDisplayValue] = useState('');
    
    // Update the display value whenever the 'YYYY-MM-DD' value prop changes
    useEffect(() => {
        if (value) {
            // Attempt to parse 'YYYY-MM-DD' and format as 'MM/DD/YYYY'
            const parts = value.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10); // 1-based month from value
                const day = parseInt(parts[2], 10);

                // Create Date object using UTC to avoid timezone shifts during construction
                // Then format using local date parts for display
                const dateObj = new Date(Date.UTC(year, month - 1, day)); // Use UTC constructor

                if (!isNaN(dateObj.getTime())) {
                    // Format using local date parts (getMonth, getDate, getFullYear)
                    const displayMonth = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0'); // Use UTC methods
                    const displayDay = dateObj.getUTCDate().toString().padStart(2, '0'); // Use UTC methods
                    const displayYear = dateObj.getUTCFullYear(); // Use UTC methods
                    setDisplayValue(`${displayMonth}/${displayDay}/${displayYear}`);
                } else {
                    setDisplayValue(value); // Fallback if parsing fails
                }
            } else {
                 setDisplayValue(value); // Fallback if format is unexpected
            }
        } else {
            setDisplayValue(''); // Clear display value if input value is empty
        }
    }, [value]);
    
    // Handles clicks on the calendar icon/adornment to trigger the native date picker
    const handleCalendarClick = (e) => {
        if (e) {
            e.stopPropagation(); // Prevent event bubbling
        }
        if (actualRef && actualRef.current) {
            // Focus the hidden native input
            actualRef.current.focus();
            // Attempt to programmatically open the date picker
            try {
                 if (typeof actualRef.current.showPicker === 'function') {
                    actualRef.current.showPicker();
                 }
                 // If showPicker isn't supported, focusing is the best fallback
            } catch (error) {
                console.error("Could not call showPicker():", error);
            }
        } else {
            console.error("DateInput ref is not set correctly");
        }
        
        // Call the optional external click handler
        if (onCalendarClick) {
            onCalendarClick(e);
        }
    };

    // Passes the change event from the hidden native input to the parent component
    const handleDateChange = (e) => {
        if (onChange) {
            onChange(e);
        }
    };

    return (
        // Relative container for positioning the hidden input over the TextField
        <div style={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
            {/* The visible TextField showing the formatted date */}
            <TextField
                fullWidth={fullWidth}
                label={label}
                variant="outlined"
                value={displayValue} // Show the formatted date
                required={required}
                disabled={disabled}
                slotProps={{
                    input: {
                        readOnly: true, // Prevent manual typing in the visible field
                        style: { cursor: 'pointer' }, // Indicate it's clickable
                        // End adornment with the calendar icon
                        endAdornment: (
                            <InputAdornment 
                                position="end" 
                                onClick={handleCalendarClick} // Trigger picker on adornment click
                                sx={{ cursor: 'pointer' }} 
                            >
                                <CalendarTodayIcon
                                    sx={{ color: mode === 'light' ? 'black' : 'white' }}
                                />
                            </InputAdornment>
                        ),
                    },
                    inputLabel: {
                        shrink: true, // Keep the label shrunk
                    }
                }}
                {...props} // Pass down other TextField props
            />
            
            {/* The hidden native date input that provides the actual functionality */}
            <input
                type="date"
                ref={actualRef} // Attach the ref here
                value={value || ''} // Bind to the 'YYYY-MM-DD' value
                onChange={handleDateChange} // Handle native input changes
                required={required}
                disabled={disabled}
                style={{
                    opacity: 0, // Make it invisible
                    position: 'absolute', // Position over the TextField
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer', // Use pointer cursor
                    pointerEvents: 'none' // Allow clicks to pass through to the adornment below
                }}
                // Do NOT pass {...props} here, as TextField props might conflict
            />
        </div>
    );
});

export default DateInput;
