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

import React, { useState, useEffect } from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

// Import Firebase Storage functions and Auth context
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useAuth } from '../../contexts/AuthContext';

/**
 * Internal component to fetch and display a link to a receipt stored in Firebase Storage.
 * @param {object} props
 * @param {string} props.receiptUri - The gs:// URI of the receipt file.
 */
export default function ReceiptLink({ receiptUri }) {
    const { app } = useAuth();
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true; // Prevent state update on unmounted component
        const fetchUrl = async () => {
            if (!receiptUri || !app) return;

            setLoading(true);
            setError(null);
            setDownloadUrl(null);

            try {
                const storage = getStorage(app);
                // Create ref directly from gs:// URI
                const storageRef = ref(storage, receiptUri);
                const url = await getDownloadURL(storageRef);
                if (isMounted) {
                    setDownloadUrl(url);
                }
            } catch (err) {
                console.error("Error getting download URL:", err);
                if (isMounted) {
                    // Handle specific errors if needed (e.g., permissions)
                    setError("Could not load receipt link.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUrl();

        return () => {
            isMounted = false; // Cleanup function
        };
    }, [receiptUri, app]); // Re-run if URI or app instance changes

    if (loading) {
        return (
            <Tooltip title="Loading receipt link...">
                <CircularProgress size={14} sx={{ ml: 1, verticalAlign: 'middle' }} />
            </Tooltip>
        );
    }

    if (error) {
        return (
            <Tooltip title={error}>
                 <Typography component="span" variant="caption" sx={{ ml: 1, color: 'error.main', fontStyle: 'italic' }}>
                    (Link Error)
                 </Typography>
            </Tooltip>
        );
    }

    if (downloadUrl) {
        return (
            <Link
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="caption"
                sx={{ ml: 0.5, verticalAlign: 'middle', fontSize: '100%' }}
            >
                (View Receipt)
            </Link>
        );
    }

    return null; // Render nothing if no URI or still initializing
}
