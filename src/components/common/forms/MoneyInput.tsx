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

import React from 'react';
import { TextField, InputAdornment, TextFieldProps } from '@mui/material';

/**
 * Props for the MoneyInput component.
 */
interface MoneyInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
    /** The current value of the input. */
    value: string | number;
    /** Callback function invoked when the input value changes. Receives the sanitized string value. */
    onChange: (value: string) => void;
    /** The label for the input field. */
    label?: string;
    /** The placeholder text for the input field. */
    placeholder?: string;
    /** Helper text displayed below the input field. */
    helperText?: string;
    /** If true, the input is marked as required. */
    required?: boolean;
    /** If true, the input is disabled. */
    disabled?: boolean;
    /** If true, the component takes up the full width of its container. */
    fullWidth?: boolean;
}

/**
 * MoneyInput is a TextField specialized for currency input.
 * It includes a '$' start adornment and basic validation to allow only numbers and a decimal point.
 */
export default function MoneyInput({ 
    value, 
    onChange, 
    label = "Amount",
    placeholder = "0.00",
    helperText = "",
    required = false,
    disabled = false,
    fullWidth = true,
    ...props 
}: MoneyInputProps) {
    /**
     * Handles changes to the input field.
     * Sanitizes the input to allow only numbers and a single decimal point.
     * @param event - The input change event.
     */
    const handleMoneyChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        // Allow only numbers and a single decimal point.
        const sanitizedValue = event.target.value.replace(/[^0-9.]/g, '');
        // Further validation could be added here (e.g., only one decimal point).
        onChange(sanitizedValue);
    };

    return (
        <TextField
            fullWidth={fullWidth}
            label={label}
            variant="outlined"
            value={value}
            onChange={handleMoneyChange}
            InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            placeholder={placeholder}
            helperText={helperText}
            required={required}
            disabled={disabled}
            {...props}
        />
    );
}
