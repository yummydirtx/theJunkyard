import React from 'react';
import { Box, Avatar, Button } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

// Component for Profile Picture Display and Upload Trigger
export default function ProfilePictureSection({ currentPhotoURL, email, onFileSelect, disabled }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        src={currentPhotoURL || undefined}
        sx={{ width: 56, height: 56 }}
      >
        {!currentPhotoURL && email ? email[0].toUpperCase() : null}
      </Avatar>
      <label htmlFor="profile-pic-upload">
        <input
          accept="image/*"
          id="profile-pic-upload"
          type="file"
          style={{ display: 'none' }}
          onChange={onFileSelect}
          disabled={disabled}
          // Reset value on click to allow re-selecting the same file
          onClick={(event) => { event.target.value = null }}
        />
        <Button
          variant="outlined"
          component="span"
          startIcon={<PhotoCamera />}
          disabled={disabled}
        >
          Change Picture
        </Button>
      </label>
    </Box>
  );
}
