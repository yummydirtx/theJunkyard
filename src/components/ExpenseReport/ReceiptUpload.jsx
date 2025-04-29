// src/components/ExpenseReport/ReceiptUpload.jsx

import React, { useState, useRef } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert'; // Import Alert for displaying error messages

// Import Firebase Storage functions and Auth context
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { useAuth } from '../../contexts/AuthContext';

/**
 * A component that allows users to select and upload a receipt file (image or PDF)
 * to Firebase Storage. It performs basic validation and reports the upload status
 * and the resulting Google Cloud Storage URI.
 * @param {object} props - Component props.
 * @param {function} props.onUploadComplete - Callback function invoked after a successful upload.
 *                                            Receives (gsUri: string, mimeType: string).
 * @param {boolean} [props.disabled=false] - If true, disables the upload button.
 */
export default function ReceiptUpload({ onUploadComplete, disabled = false }) {
    const { app, activeUser } = useAuth(); // Get Firebase app instance and authenticated user from context
    const storage = getStorage(app); // Initialize Firebase Storage

    // --- State Variables ---
    const [selectedFileName, setSelectedFileName] = useState(''); // Name of the file selected by the user
    const [uploading, setUploading] = useState(false); // True while the file is being uploaded
    const [error, setError] = useState(null); // Stores error messages related to file selection or upload

    // --- Refs ---
    const fileInputRef = useRef(null); // Ref to the hidden file input element, used to reset it programmatically

    /**
     * Handles the file selection event from the hidden input.
     * Validates the selected file (type, size) and initiates the upload process if valid.
     * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event.
     */
    const handleFileChange = async (event) => {
        const file = event.target.files[0]; // Get the selected file

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
            // Optionally clear file name and reset input here as well
            setSelectedFileName('');
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        try {
            // --- Firebase Storage Upload ---
            // Create a unique file path in Storage: `expenseReceipts/{userId}/{timestamp}_{originalFilename}`
            // This helps organize files per user and avoids name collisions.
            const filePath = `expenseReceipts/${activeUser.uid}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, filePath); // Create a reference to the storage location

            // Start the upload process
            console.log(`Uploading receipt to: ${filePath}`);
            const snapshot = await uploadBytes(storageRef, file); // Upload the file blob
            console.log('Uploaded successfully!', snapshot); // Log success details

            // Construct the gs:// URI required by Vertex AI
            const gsUri = `gs://${snapshot.ref.bucket}/${snapshot.ref.fullPath}`;
            console.log('File available at gs URI:', gsUri);

            // --- Callback ---
            // Call the parent component's callback function with the gs:// URI and the file's MIME type
            if (onUploadComplete) {
                onUploadComplete(gsUri, file.type);
            }

            // Note: Clearing the selected file name and resetting the input *after* successful
            // processing in the parent might be desired. Currently, it's cleared on error or new selection.
            // Example:
            // setSelectedFileName('');
            // if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (uploadError) {
            // Handle errors during the Firebase Storage upload
            console.error("Error uploading file:", uploadError);
            setError(`Error uploading file: ${uploadError.message}`); // Display a user-friendly error
             // Clear file name and reset input on upload error
            setSelectedFileName('');
            if (fileInputRef.current) fileInputRef.current.value = "";
        } finally {
            // Ensure uploading state is reset regardless of success or failure
            setUploading(false);
        }
    };

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            {/* The visible button that triggers the hidden file input */}
            <Button
                component="label" // Makes the button act like a <label> for the hidden input
                role={undefined} // Accessibility attribute
                variant="outlined"
                tabIndex={-1} // Removes button from tab order (input itself might be focusable)
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />} // Show spinner or icon
                // Disable button if parent component disables it OR if an upload is in progress
                disabled={disabled || uploading}
            >
                {/* Change button text based on uploading state */}
                {uploading ? 'Uploading...' : 'Upload Receipt'}
                {/* The actual file input element, visually hidden */}
                <input
                    type="file"
                    hidden // Hides the default browser file input UI
                    onChange={handleFileChange} // Triggered when a file is selected
                    // Specify which file types the browser should suggest
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    ref={fileInputRef} // Attach the ref to allow programmatic reset
                    // Also disable the input itself when the button is disabled
                    disabled={disabled || uploading}
                />
            </Button>
            {/* Display the name of the selected file if not uploading and no error */}
            {selectedFileName && !uploading && !error && (
                <Typography variant="body2" sx={{ display: 'inline', ml: 1 }}>
                    Selected: {selectedFileName}
                </Typography>
            )}
             {/* Display Error Messages using MUI Alert component */}
            {error && (
                 <Alert severity="error" sx={{ mt: 1, fontSize: '0.8rem' }}>{error}</Alert>
            )}
        </Box>
    );
}