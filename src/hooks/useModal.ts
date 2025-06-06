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

export type UseModalReturn = [boolean, () => void, () => void];

/**
 * Custom hook for managing the state of a modal (open/closed).
 * Provides a boolean state and functions to open and close the modal.
 *
 * @param initialState - The initial state of the modal (whether it's open or closed).
 * @returns A tuple containing:
 *  - `isOpen` {boolean}: The current open/closed state of the modal.
 *  - `open` {function}: Function to set the modal state to open (true).
 *  - `close` {function}: Function to set the modal state to closed (false).
 */
export default function useModal(initialState: boolean = false): UseModalReturn {
    const [isOpen, setIsOpen] = useState<boolean>(initialState);
    
    const open = (): void => setIsOpen(true);
    const close = (): void => setIsOpen(false);
    
    return [isOpen, open, close];
}
