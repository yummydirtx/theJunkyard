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
                sx={{ ml: 0.5, verticalAlign: 'middle' }}
            >
                (View Receipt)
            </Link>
        );
    }

    return null; // Render nothing if no URI or still initializing
}
