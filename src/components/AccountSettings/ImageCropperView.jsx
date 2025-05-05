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

import React from 'react';
import { Stack, Typography, Button, CircularProgress } from '@mui/material';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Component for Image Cropping View
export default function ImageCropperView({
  imageSrc,
  crop,
  onCropChange,
  onCropComplete,
  aspect,
  onImageLoad,
  imgRef,
  onSaveCrop,
  onCancelCrop,
  loading,
}) {
  return (
    <Stack spacing={2} alignItems="center">
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Crop your image</Typography>
      <ReactCrop
        crop={crop}
        onChange={(_, percentCrop) => onCropChange(percentCrop)}
        onComplete={(c) => onCropComplete(c)}
        aspect={aspect}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          alt="Crop me"
          src={imageSrc}
          onLoad={onImageLoad}
          style={{ maxHeight: '70vh', display: 'block', width: '100%', height: 'auto' }} // Ensure image scales correctly
        />
      </ReactCrop>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button onClick={onCancelCrop} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSaveCrop}
          // Disable save if crop data isn't ready (onCropComplete wouldn't have run) or if loading
          disabled={!crop || crop.width === 0 || crop.height === 0 || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : 'Save Crop'}
        </Button>
      </Stack>
    </Stack>
  );
}
