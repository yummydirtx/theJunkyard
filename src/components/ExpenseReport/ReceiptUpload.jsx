import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// TODO: Implement actual file upload logic to Firebase Storage
export default function ReceiptUpload({ onFileSelect }) {
    const [selectedFileName, setSelectedFileName] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFileName(file.name);
            onFileSelect(file); // Pass the file object up
            console.log("Receipt selected:", file);
            // Placeholder: Add upload logic here
        } else {
            setSelectedFileName('');
            onFileSelect(null);
        }
    };

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <Button
                component="label"
                role={undefined}
                variant="outlined"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
            >
                Upload Receipt
                <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept="image/*,.pdf" // Specify acceptable file types
                />
            </Button>
            {selectedFileName && (
                <Typography variant="body2" sx={{ display: 'inline', ml: 1 }}>
                    Selected: {selectedFileName}
                </Typography>
            )}
            {/* Placeholder for upload progress */}
            {/* <LinearProgress variant="determinate" value={uploadProgress} /> */}
        </Box>
    );
}
