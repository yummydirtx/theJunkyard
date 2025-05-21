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

/**
 * DateInput is a custom component that provides a user-friendly date input field.
 * It displays the date in MM/DD/YYYY format but uses an underlying native HTML5
 * date input (type="date") for the actual date picking, which expects YYYY-MM-DD format.
 * This approach combines a consistent visual style with native date picker functionality.
 * The component is forwardRef-enabled to allow parent components to interact with the underlying native input.
 * @param {object} props - The component's props.
 * @param {string} props.value - The date value in 'YYYY-MM-DD' format.
 * @param {function} props.onChange - Callback function invoked when the date changes. Receives the change event from the native input.
 * @param {string} [props.label="Date"] - The label for the TextField.
 * @param {boolean} [props.required=false] - If true, the input is marked as required.
 * @param {boolean} [props.disabled=false] - If true, the input is disabled.
 * @param {string} [props.mode='light'] - The current theme mode ('light' or 'dark'), used for icon coloring.
 * @param {function} [props.onCalendarClick] - Optional callback for when the calendar icon is clicked.
 * @param {boolean} [props.fullWidth=true] - If true, the component takes up the full width of its container.
 * @param {React.Ref} ref - Forwarded ref to the underlying native date input element.
 */
const DateInput = forwardRef(({ 
    value,
    onChange,
    label = "Date", 
    required = false,
    disabled = false,
    mode = 'light', // Theme mode for icon color
    onCalendarClick,// Optional callback for calendar icon click
    fullWidth = true,
    ...props
}, ref) => {
    // Use internal ref if no external ref is provided for the hidden native input
    const innerRef = useRef(null);
    const actualRef = ref || innerRef;
    
    /** @state {string} displayValue - Formatted date string for display (e.g., MM/DD/YYYY). */
    const [displayValue, setDisplayValue] = useState('');
    
    // Effect to update the displayValue whenever the 'YYYY-MM-DD' value prop changes.
    // It parses 'YYYY-MM-DD' and formats it to 'MM/DD/YYYY' for the visible TextField.
    useEffect(() => {
        if (value) {
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
    
    /**
     * Handles clicks on the calendar icon or the TextField itself.
     * It programmatically focuses and attempts to open the native date picker
     * of the hidden input element.
     * @param {React.MouseEvent} [e] - The click event.
     */
    const handleCalendarClick = (e) => {
        if (e) {
            e.stopPropagation();
        }
        if (actualRef && actualRef.current) {
            actualRef.current.focus();
            try {
                 if (typeof actualRef.current.showPicker === 'function') {
                    actualRef.current.showPicker();
                 }
            } catch (error) {
                console.error("Could not call showPicker():", error);
            }
        } else {
            console.error("DateInput ref is not set correctly");
        }
        
        if (onCalendarClick) {
            onCalendarClick(e);
        }
    };

    /**
     * Passes the change event from the hidden native date input to the parent component's onChange handler.
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the native date input.
     */
    const handleDateChange = (e) => {
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div style={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
            {/* The visible TextField showing the formatted date. This field is read-only. */}
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
            
            {/* The hidden native date input that provides the actual date picking functionality.
                It is positioned over the TextField and made invisible. */}
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
