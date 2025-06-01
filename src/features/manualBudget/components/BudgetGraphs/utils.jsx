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

/**
 * Generates a random color in HSL format.
 * The saturation is kept between 60-100% and lightness between 40-70%
 * to ensure reasonably vibrant and visible colors.
 * @returns {string} A string representing an HSL color (e.g., "hsl(120, 70%, 50%)").
 */
export const generateRandomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(60 + Math.random() * 40);
    const l = Math.floor(40 + Math.random() * 30);
    return `hsl(${h}, ${s}%, ${l}%)`;
};

/**
 * Formats a numeric value as a USD currency string.
 * @param {number} value - The numeric value to format.
 * @returns {string} A string representing the value formatted as USD currency (e.g., "$1,234.56").
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value);
};

/**
 * Validates if a given string is in the 'YYYY-MM' format.
 * @param {string} month - The string to validate.
 * @returns {boolean} True if the string matches the 'YYYY-MM' format, false otherwise.
 */
export const isValidMonth = (month) => {
    return month && /^\d{4}-\d{2}$/.test(month);
};
