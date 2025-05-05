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
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
// Import Firebase functions if not already (assuming initialized elsewhere)
import { getFunctions, httpsCallable } from "firebase/functions";
import { initializeApp, getApps, getApp } from "firebase/app"; // To get app instance

// Ensure Firebase app is initialized (similar pattern to SharedExpenseReport)
let app;
if (getApps().length === 0) {
    // This component might not have the config, rely on parent initialization
    // If it might be used standalone, add config and initialization here.
    // For now, assume app is initialized by the time this renders.
    app = getApp();
} else {
    app = getApp();
}
const functions = app ? getFunctions(app) : null;

/**
 * Displays a link to view a receipt. Fetches a signed URL if necessary (e.g., for shared reports).
 * @param {object} props
 * @param {string} props.receiptUri - The gs:// URI of the receipt.
 * @param {string} [props.shareId] - The share ID (required if isSharedView is true).
 * @param {string} [props.expenseId] - The expense ID (required if isSharedView is true).
 * @param {boolean} [props.isSharedView=false] - Indicates if the link is being rendered in a shared context.
 */
export default function ReceiptLink({ receiptUri, shareId, expenseId, isSharedView = false }) {
    const [downloadUrl, setDownloadUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Only fetch signed URL if it's a shared view and we have the necessary IDs and functions
        if (isSharedView && functions && shareId && expenseId && receiptUri) {
            const fetchSignedUrl = async () => {
                setLoading(true);
                setError('');
                setDownloadUrl(''); // Clear previous URL

                try {
                    const getReceiptDownloadUrl = httpsCallable(functions, 'getReceiptDownloadUrl');
                    console.log(`[ReceiptLink] Calling getReceiptDownloadUrl for shareId: ${shareId}, expenseId: ${expenseId}`);
                    const result = await getReceiptDownloadUrl({ shareId, expenseId });
                    console.log("[ReceiptLink] Signed URL result:", result.data);

                    if (result.data && result.data.downloadUrl) {
                        setDownloadUrl(result.data.downloadUrl);
                    } else {
                        throw new Error("No download URL received from function.");
                    }
                } catch (err) {
                    console.error("[ReceiptLink] Error fetching signed URL:", err);
                    setError(err.message || 'Failed to get receipt link.');
                } finally {
                    setLoading(false);
                }
            };

            fetchSignedUrl();
        } else if (!isSharedView) {
            // Handle non-shared view (e.g., direct download URL - though this might also fail if rules change)
            // For simplicity, we'll just show a placeholder or potentially fetch differently later.
            // Currently, this component is primarily used in SharedExpenseReport where isSharedView=true.
            // If used elsewhere, direct URL fetching logic would be needed here.
             console.warn("[ReceiptLink] Non-shared view or missing props, cannot fetch signed URL.");
             // setDownloadUrl(receiptUri); // Or fetch direct URL if needed
        }
    }, [receiptUri, shareId, expenseId, isSharedView, functions]); // Add functions to dependency array

    if (!receiptUri) return null; // Don't render if no URI

    // Render different states: loading, error, success
    if (loading) {
        return <CircularProgress size={12} sx={{ ml: 0.5, verticalAlign: 'middle' }} />;
    }

    if (error) {
        return (
            <Tooltip title={`Error: ${error}`} placement="top">
                <ErrorOutlineIcon color="error" sx={{ fontSize: 'inherit', ml: 0.5, verticalAlign: 'middle' }} />
            </Tooltip>
        );
    }

    if (downloadUrl) {
        return (
            <Link
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ml: 0.5 }} // Add slight margin if needed
                onClick={(e) => e.stopPropagation()} // Prevent clicks on list items etc.
            >
                (View)
            </Link>
        );
    }

    // Fallback if not shared or URL not fetched yet (and not loading/error)
    // You might want a placeholder or different behavior here.
    return null;
}
