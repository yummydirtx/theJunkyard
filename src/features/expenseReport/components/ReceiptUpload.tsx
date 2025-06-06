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

import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
// Import Firebase Storage functions and Auth context
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { useAuth } from '../../../contexts/AuthContext';

interface ReceiptUploadProps {
  onUploadComplete: (gsUri: string, mimeType: string) => void;
  disabled?: boolean;
}

/**
 * A component that allows users to select and upload a receipt file (image or PDF)
 * to Firebase Storage. It performs basic validation and reports the upload status
 * and the resulting Google Cloud Storage URI.
 */
export default function ReceiptUpload({ onUploadComplete, disabled = false }: ReceiptUploadProps) {
    const { app, activeUser } = useAuth(); // Get Firebase app instance and authenticated user from context
    const storage = getStorage(app); // Initialize Firebase Storage

    // --- State Variables ---
    const [selectedFileName, setSelectedFileName] = useState(''); // Name of the file selected by the user
    const [uploading, setUploading] = useState(false); // True while the file is being uploaded
    const [error, setError] = useState<string | null>(null); // Stores error messages related to file selection or upload

    // --- Refs ---
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref to the hidden file input element

    // --- Effect to clear file input on mount/remount ---
    useEffect(() => {
        // Clear the actual file input value when the component mounts or the key changes
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        // Reset component-specific state as well if needed, though remounting handles this
        setSelectedFileName('');
        setError(null);
        setUploading(false);
    }, []); // Empty dependency array ensures this runs on mount (and remount due to key change)

    /**
     * Handles the file selection event from the hidden input.
     * Validates the selected file (type, size) and initiates the upload process if valid.
     */
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Get the selected file

        // Reset state if no file is selected (e.g., user cancels the dialog)
        if (!file) {
            setSelectedFileName('');
            setError(null);
            return;
        }

        // --- Client-Side File Validation ---
        const MAX_SIZE_MB = 10; // Maximum allowed file size in megabytes
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024; // Convert MB to bytes
        // Define allowed MIME types for receipts
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

        // Check file size
        if (file.size > MAX_SIZE_BYTES) {
            setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
            setSelectedFileName(''); // Clear display name
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset the file input so the same file can be re-selected after error
            return; // Stop processing
        }
        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Invalid file type. Please select a JPG, PNG, WEBP image or a PDF.');
            setSelectedFileName(''); // Clear display name
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset the file input
            return; // Stop processing
        }
        // --- End Validation ---

        // If validation passes, proceed with the upload
        setSelectedFileName(file.name); // Display the selected file name
        setError(null); // Clear any previous errors
        setUploading(true); // Set uploading state to true, disable button, show spinner

        // Ensure user is authenticated before attempting upload
        if (!activeUser) {
            setError("User not authenticated. Cannot upload file.");
            setUploading(false); // Reset uploading state
            setSelectedFileName('');
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        try {
            // --- Firebase Storage Upload ---
            const filePath = `expenseReceipts/${activeUser.uid}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, filePath);
            console.log(`Uploading receipt to: ${filePath}`);
            const snapshot = await uploadBytes(storageRef, file);
            console.log('Uploaded successfully!', snapshot);

            // Construct the gs:// URI
            const gsUri = `gs://${snapshot.metadata.bucket}/${snapshot.metadata.fullPath}`;
            console.log('Generated gsUri:', gsUri);

            // Call the callback function with the gs:// URI and MIME type
            onUploadComplete(gsUri, file.type);

        } catch (uploadError: any) {
            console.error('Upload failed:', uploadError);
            setError(`Upload failed: ${uploadError.message}`);
            setSelectedFileName(''); // Clear filename on error
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input on error
        } finally {
            setUploading(false); // Set uploading state back to false
        }
    };

    // --- Trigger File Input Click ---
    /**
     * Programmatically clicks the hidden file input element when the visible button is clicked.
     */
    const handleButtonClick = () => {
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Trigger the hidden input
        }
    };

    return (
        <Box sx={{ my: 2 }}>
            {/* Hidden File Input */}
            <Input
                type="file"
                inputRef={fileInputRef}
                onChange={handleFileChange}
                sx={{ display: 'none' }} // Hide the default input element
                inputProps={{ accept: "image/jpeg,image/png,image/webp,application/pdf" }}
            />

            {/* Visible Upload Button */}
            <Button
                variant="outlined"
                onClick={handleButtonClick}
                disabled={disabled || uploading} // Disable if globally disabled or currently uploading
                startIcon={uploading ? <CircularProgress size={20} /> : null} // Show spinner when uploading
            >
                {uploading ? 'Uploading...' : 'Upload Receipt (Optional)'}
            </Button>

            {/* Display Selected File Name or Status */}
            {selectedFileName && !error && (
                <Typography variant="body2" sx={{ display: 'inline', ml: 2 }}>
                    Selected: {selectedFileName}
                </Typography>
            )}

            {/* Display Error Message */}
            {error && (
                <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>
            )}
        </Box>
    );
}
