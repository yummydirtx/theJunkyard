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

import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { Avatar, Box, Button } from '@mui/material';

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
