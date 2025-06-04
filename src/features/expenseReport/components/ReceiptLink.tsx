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

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useState } from 'react';
// Import Firebase functions and storage
import { getApp, getApps } from "firebase/app"; // To get app instance
import { getFunctions, httpsCallable } from "firebase/functions";
import { getDownloadURL, getStorage, ref } from "firebase/storage"; // Import storage functions

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
const storage = app ? getStorage(app) : null; // Initialize storage

interface ReceiptLinkProps {
  receiptUri?: string;
  shareId?: string;
  expenseId?: string;
  isSharedView?: boolean;
}

/**
 * Displays a link to view a receipt. Fetches a signed URL for shared reports,
 * or a standard download URL for non-shared views.
 */
export default function ReceiptLink({ receiptUri, shareId, expenseId, isSharedView = false }: ReceiptLinkProps) {
    const [downloadUrl, setDownloadUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        setDownloadUrl(''); // Clear previous URL on any change

        // Fetch signed URL for shared view
        if (isSharedView && functions && shareId && expenseId && receiptUri) {
            const fetchSignedUrl = async () => {
                try {
                    const getReceiptDownloadUrl = httpsCallable(functions, 'getReceiptDownloadUrl');
                    console.log(`[ReceiptLink] Calling getReceiptDownloadUrl for shareId: ${shareId}, expenseId: ${expenseId}`);
                    const result = await getReceiptDownloadUrl({ shareId, expenseId });
                    console.log("[ReceiptLink] Signed URL result:", result.data);

                    if (result.data && (result.data as any).downloadUrl) {
                        setDownloadUrl((result.data as any).downloadUrl);
                    } else {
                        throw new Error("No download URL received from function.");
                    }
                } catch (err: any) {
                    console.error("[ReceiptLink] Error fetching signed URL:", err);
                    setError(err.message || 'Failed to get receipt link.');
                } finally {
                    setLoading(false);
                }
            };
            fetchSignedUrl();
        }
        // Fetch standard download URL for non-shared view
        else if (!isSharedView && storage && receiptUri) {
            const fetchDirectUrl = async () => {
                try {
                    console.log(`[ReceiptLink] Getting direct download URL for: ${receiptUri}`);
                    const storageRef = ref(storage, receiptUri); // Create ref from gs:// URI
                    const url = await getDownloadURL(storageRef);
                    console.log("[ReceiptLink] Direct URL result:", url);
                    setDownloadUrl(url);
                } catch (err: any) {
                    console.error("[ReceiptLink] Error fetching direct download URL:", err);
                    // Handle potential errors like object not found or permission issues
                    if (err.code === 'storage/object-not-found') {
                         setError('Receipt file not found.');
                    } else if (err.code === 'storage/unauthorized') {
                         setError('Permission denied to view receipt.');
                    } else {
                        setError(err.message || 'Failed to get receipt link.');
                    }
                } finally {
                    setLoading(false);
                }
            };
            fetchDirectUrl();
        }
        // Handle cases where fetching isn't possible
        else {
             console.warn("[ReceiptLink] Cannot fetch URL. Missing dependencies:", { isSharedView, functions, storage, shareId, expenseId, receiptUri });
             setError("Cannot load receipt link."); // Set an error if no URL can be fetched
             setLoading(false);
        }
    }, [receiptUri, shareId, expenseId, isSharedView, functions, storage]);

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
