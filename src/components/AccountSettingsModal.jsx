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

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Alert,
  Stack,
  CircularProgress,
  Typography,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../contexts/AuthContext';
import { sendPasswordResetEmail, updateProfile, deleteUser } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import ConfirmationDialog from './ConfirmationDialog';

// Import react-image-crop
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; // Import css

// Helper function to convert Data URL to Blob
function dataURLtoBlob(dataurl) {
    // Check if dataurl is valid
    if (!dataurl || !dataurl.includes(',')) {
        console.error("Invalid data URL provided to dataURLtoBlob:", dataurl);
        return null; // Return null or throw an error
    }
    try {
        const arr = dataurl.split(',');
        // Check if split result is valid
        if (!arr || arr.length < 2) {
            console.error("Could not split data URL:", dataurl);
            return null;
        }
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch || mimeMatch.length < 2) {
            console.error("Could not extract mime type from data URL:", arr[0]);
            return null;
        }
        const mime = mimeMatch[1];
        const bstr = atob(arr[arr.length - 1]); // Use arr.length - 1 for robustness
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    } catch (e) {
        console.error("Error in dataURLtoBlob:", e, "Data URL:", dataurl.substring(0, 100) + "..."); // Log error and truncated data URL
        return null; // Return null on error
    }
}

// Helper function to center the initial crop area (from react-image-crop docs)
function centerAspectCrop(
  mediaWidth,
  mediaHeight,
  aspect,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90, // Initial crop size percentage
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

// Helper function to create cropped image blob (using canvas)
// Removed async from Promise executor.
async function getCroppedImg(
  image,
  pixelCrop,
  fileName,
  fileType = 'image/png' // Keep param for potential future use, but ignore for export
) {
  // ... (initial logging, checks) ...
  // console.log('getCroppedImg started.');
  // ...

  const MAX_CANVAS_DIMENSION = 4096;
  const MAX_CANVAS_AREA = MAX_CANVAS_DIMENSION * MAX_CANVAS_DIMENSION;

  const initialCanvas = document.createElement('canvas');
  const initialCtx = initialCanvas.getContext('2d');
  if (!initialCtx) {
    console.error('getCroppedImg error: Failed to get 2d context.');
    throw new Error('No 2d context');
  }
  // console.log('Initial canvas context obtained.');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  // console.log('Calculated scales:', { scaleX, scaleY });

  const originalTargetWidth = Math.floor(pixelCrop.width * scaleX);
  const originalTargetHeight = Math.floor(pixelCrop.height * scaleY);
  let targetWidth = originalTargetWidth;
  let targetHeight = originalTargetHeight;

  let dimensionDownScale = 1;
  let areaDownScale = 1;

  // console.log(`Original calculated dimensions (pixelCrop * scale): ${originalTargetWidth}x${originalTargetHeight}`);

  // ---> Check dimension limit <---
  if (targetWidth > MAX_CANVAS_DIMENSION || targetHeight > MAX_CANVAS_DIMENSION) {
    // ... (dimension downscale logic) ...
    // console.log(`Dimensions after dimension capping: ${targetWidth}x${targetHeight}`);
  } else {
    // console.log('Dimensions within limit. No dimension downscale needed.');
  }

  // ---> Check area limit <---
  const currentArea = targetWidth * targetHeight;
  // console.log(`Area after dimension capping: ${currentArea} pixels`);
  if (currentArea > MAX_CANVAS_AREA) {
      // ... (area downscale logic) ...
  } else {
      // console.log('Area within limit. No area downscale needed.');
  }

  // ---> Combine downscale factors <---
  const combinedDownScaleFactor = dimensionDownScale * areaDownScale;
  // console.log(`Final combined downscale factor: ${combinedDownScaleFactor.toFixed(4)}`);

  // ---> Calculate final target dimensions using combined factor <---
  targetWidth = Math.floor(originalTargetWidth * combinedDownScaleFactor);
  targetHeight = Math.floor(originalTargetHeight * combinedDownScaleFactor);

  if (targetWidth < 1 || targetHeight < 1) {
      console.error(`getCroppedImg error: Calculated canvas dimensions too small (${targetWidth}x${targetHeight}) after scaling.`);
      throw new Error(`Calculated canvas dimensions are too small (${targetWidth}x${targetHeight}) after scaling.`);
  }

  // ---> MOVED: Set the final canvas dimensions and log AFTER calculation <---
  // console.log(`Final target canvas size: ${targetWidth}x${targetHeight}`);
  initialCanvas.width = targetWidth;
  initialCanvas.height = targetHeight;
  // console.log(`Set initialCanvas dimensions: ${initialCanvas.width}x${initialCanvas.height}`);

  // ---> Apply COMBINED downScaleFactor scaling to context <---
  // console.log(`Applying context scale: ${combinedDownScaleFactor.toFixed(4)}`);
  initialCtx.scale(combinedDownScaleFactor, combinedDownScaleFactor);
  initialCtx.imageSmoothingQuality = 'high';

  const cropX = pixelCrop.x * scaleX;
  const cropY = pixelCrop.y * scaleY;
  const sourceCropWidth = pixelCrop.width * scaleX;
  const sourceCropHeight = pixelCrop.height * scaleY;

  const destWidth = initialCanvas.width / combinedDownScaleFactor;
  const destHeight = initialCanvas.height / combinedDownScaleFactor;

  // console.log('Calculated source parameters for drawImage:', { cropX, cropY, sourceCropWidth, sourceCropHeight });
  // console.log('Calculated destination parameters for drawImage:', { destWidth, destHeight });

  try {
    // ---> FIX: Correctly log the parameters object <---
    const drawParams = {
        sx: cropX, sy: cropY, sWidth: sourceCropWidth, sHeight: sourceCropHeight,
        dx: 0, dy: 0, dWidth: destWidth, dHeight: destHeight
    };
    // console.log('Calling initialCtx.drawImage with:', drawParams);
    // console.log('Image element details:', { complete: image.complete, src: image.src.substring(0,100) + '...' }); // Optional: More image details

    initialCtx.drawImage(
      image,
      cropX, cropY, sourceCropWidth, sourceCropHeight,
      0, 0, destWidth, destHeight
    );
    // console.log('initialCtx.drawImage completed.');
  } catch (drawError) {
      console.error('Error during initialCtx.drawImage:', drawError);
      console.error('DrawImage parameters were:', {
          sx: cropX, sy: cropY, sWidth: sourceCropWidth, sHeight: sourceCropHeight,
          dx: 0, dy: 0, dWidth: destWidth, dHeight: destHeight
      });
      throw new Error(`Failed to draw image onto canvas: ${drawError.message}`);
  }


  // --- Resizing Logic (for file size) ---
  const maxSizeBytes = 1 * 1024 * 1024; // 1MB
  const scaleFactor = 0.9;
  const minDimension = 100;
  const maxAttempts = 10;
  const exportFileType = 'image/jpeg';
  const initialJpegQuality = 0.9;

  let currentCanvas = initialCanvas;
  let quality = initialJpegQuality;

  // ---> ADD LOG: Before returning the Promise <---
  // console.log('Finished initial canvas setup. Preparing to return Promise for resizing loop.');

  // ---> REMOVE async from the executor function signature <---
  return new Promise((resolve, reject) => {
    // ---> ADD LOG: As the first line inside the Promise executor <---
    // console.log('Entered Promise executor for resizing loop.');
    // console.log(`Starting resizing loop. Target format: ${exportFileType}`);
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // ... (rest of the resizing loop remains the same) ...
      // console.log(`--- Resizing Loop Attempt ${attempt + 1} ---`);

      // ---> Now this block should execute correctly <---
      if (!currentCanvas || currentCanvas.width <= 0 || currentCanvas.height <= 0) {
        console.error(`Attempt ${attempt + 1}: Invalid canvas dimensions before Data URL generation - ${currentCanvas?.width}x${currentCanvas?.height}`);
        return reject(new Error('Invalid canvas dimensions during processing.'));
      }

      // console.log(`Attempt ${attempt + 1}: Current canvas dimensions: ${currentCanvas.width}x${currentCanvas.height}`);

      let blob = null;
      try {
        // console.log(`Attempt ${attempt + 1}: Calling currentCanvas.toDataURL (type: ${exportFileType}, quality: ${quality.toFixed(2)})`);
        const dataUrl = currentCanvas.toDataURL(exportFileType, quality);
        // console.log(`Attempt ${attempt + 1}: toDataURL finished. Data URL length: ${dataUrl?.length ?? 'null/undefined'}`);

        if (!dataUrl || dataUrl === 'data:,') {
             console.error(`Attempt ${attempt + 1}: Failed to generate valid Data URL (returned: ${dataUrl?.substring(0, 30)}...) for canvas size ${currentCanvas.width}x${currentCanvas.height}`);
             return reject(new Error(`Canvas Data URL generation failed (using ${exportFileType}). The canvas might be too large or corrupted.`));
        }

        // console.log(`Attempt ${attempt + 1}: Calling dataURLtoBlob.`);
        blob = dataURLtoBlob(dataUrl);
        // console.log(`Attempt ${attempt + 1}: dataURLtoBlob finished. Blob size: ${blob?.size ?? 'null'}, Blob type: ${blob?.type ?? 'null'}`);

        if (!blob) {
           console.error(`Attempt ${attempt + 1}: dataURLtoBlob returned null.`);
           return reject(new Error('Failed to convert Data URL to Blob.'));
        }

      } catch (error) {
          console.error(`Attempt ${attempt + 1}: Error during Data URL generation or conversion for canvas size ${currentCanvas.width}x${currentCanvas.height}:`, error);
          if (error.name === 'QuotaExceededError') {
             console.error(`Attempt ${attempt + 1}: QuotaExceededError encountered.`);
             return reject(new Error('Canvas is too large for Data URL generation, even after initial scaling.'));
          }
          return reject(new Error(`Canvas processing error: ${error.message}`));
      }

      // console.log(`Attempt ${attempt + 1}: Blob generated. Size = ${(blob.size / 1024 / 1024).toFixed(2)}MB`);

      if (blob.size <= maxSizeBytes) {
        const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        blob.name = `${baseName}.jpeg`;
        // console.log(`Success: Final size is within limit. Setting blob name to ${blob.name}. Resolving promise.`);
        return resolve(blob); // Use return here to exit the loop and resolve
      }

      // console.log(`Attempt ${attempt + 1}: Blob size (${blob.size}) exceeds limit (${maxSizeBytes}). Resizing needed.`);
      const newWidth = Math.floor(currentCanvas.width * scaleFactor);
      const newHeight = Math.floor(currentCanvas.height * scaleFactor);
      // console.log(`Attempt ${attempt + 1}: Calculated new dimensions: ${newWidth}x${newHeight}`);

      if (newWidth < minDimension || newHeight < minDimension) {
        console.warn(`Resizing stopped: New dimensions (${newWidth}x${newHeight}) below minimum (${minDimension}px). Rejecting.`);
         return reject(new Error(`Image could not be resized below ${minDimension}px while staying under 1MB.`)); // Use return here
      }

      // Reduce quality
      if (quality > 0.5) {
        quality -= 0.05;
        // console.log(`Attempt ${attempt + 1}: Reduced JPEG quality to ${quality.toFixed(2)} for next attempt.`);
      } else {
        // console.log(`Attempt ${attempt + 1}: JPEG quality already low (${quality.toFixed(2)}). Not reducing further.`);
      }

      // Resize canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = newWidth;
      tempCanvas.height = newHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        console.error(`Attempt ${attempt + 1}: Failed to get context for resized canvas (${newWidth}x${newHeight})`);
        return reject(new Error('Failed to get context for resized canvas.')); // Use return here
      }
      tempCtx.imageSmoothingQuality = 'medium';
      // console.log(`Attempt ${attempt + 1}: Drawing current canvas (${currentCanvas.width}x${currentCanvas.height}) onto temp canvas (${newWidth}x${newHeight})`);
      tempCtx.drawImage(currentCanvas, 0, 0, currentCanvas.width, currentCanvas.height, 0, 0, newWidth, newHeight);
      // console.log(`Attempt ${attempt + 1}: drawImage for resize complete.`);

      currentCanvas = tempCanvas; // Update canvas for the next iteration
    }

    // If loop finishes without resolving/rejecting
    console.error(`Failed to downsize image below 1MB after ${maxAttempts} attempts. Last canvas size: ${currentCanvas.width}x${currentCanvas.height}. Rejecting.`);
    reject(new Error(`Failed to downsize image below 1MB after ${maxAttempts} attempts.`));
  });
}

export default function AccountSettingsModal({ open, onClose }) {
  const { activeUser, auth, app, updateActiveUser } = useAuth();
  const storage = getStorage(app);

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState({
    resetPassword: false,
    deleteAccount: false,
    uploadPic: false,
    updateName: false, // Add loading state for name update
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // --- Cropping State ---
  const [imageSrc, setImageSrc] = useState(''); // Source for the cropper
  const [crop, setCrop] = useState(); // Current crop state (controlled)
  const [completedCrop, setCompletedCrop] = useState(); // Final pixel crop
  const [aspect, setAspect] = useState(1 / 1); // Aspect ratio 1:1 for square
  const imgRef = useRef(null); // Ref to the image element in the cropper
  const [originalFile, setOriginalFile] = useState(null); // Store the original file object
  // --- End Cropping State ---

  // --- Display Name State ---
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  // --- End Display Name State ---


  useEffect(() => {
    setMessage({ type: '', text: '' });
    // Reset cropper state when modal opens/closes or user changes
    setImageSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setOriginalFile(null);
    // Reset name editing state and value
    setIsEditingName(false);
    setDisplayName(activeUser?.displayName || ''); // Initialize with current name
  }, [open, activeUser]);

  // Initialize displayName when activeUser loads/changes if modal is already open
  useEffect(() => {
    if (activeUser) {
        setDisplayName(activeUser.displayName || '');
    }
  }, [activeUser]);

  const handleResetPassword = async () => {
    // Check if email exists on activeUser (already done)
    if (!activeUser?.email) {
        setMessage({ type: 'error', text: 'User email not found.' });
        return;
    };
    // Check if auth object and currentUser are available
    if (!auth?.currentUser) {
        setMessage({ type: 'error', text: 'Authentication context not available. Please try again.' });
        return;
    }
    setLoading(prev => ({ ...prev, resetPassword: true }));
    setMessage({ type: '', text: '' });
    try {
      // Use auth.currentUser.email which is more direct if available, fallback to activeUser.email
      const emailToSend = auth.currentUser.email || activeUser.email;
      await sendPasswordResetEmail(auth, emailToSend);
      setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
    } catch (error) {
      console.error("Password Reset Error:", error);
      setMessage({ type: 'error', text: `Failed to send reset email: ${error.message}` });
    } finally {
      setLoading(prev => ({ ...prev, resetPassword: false }));
    }
  };

  const handleDeleteAccount = async () => {
    // Check if auth.currentUser exists before attempting deletion
    if (!auth?.currentUser) {
        setMessage({ type: 'error', text: 'Cannot delete account: User not properly authenticated.' });
        setDeleteConfirmOpen(false); // Close confirmation dialog if opened
        return;
    }
    setLoading(prev => ({ ...prev, deleteAccount: true }));
    setMessage({ type: '', text: '' });
    try {
      await deleteUser(auth.currentUser);
      // Success message might not be visible as the component/app state might change rapidly upon sign-out.
      // Rely on onAuthStateChanged to handle the UI update.
      // setMessage({ type: 'success', text: 'Account deleted successfully.' });
      // onClose(); // Close modal explicitly on successful deletion if needed, though auth state change might handle it.
    } catch (error) {
      console.error("Delete Account Error:", error);
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'This operation requires recent login. Please sign out, sign back in, and try again.' });
      } else {
        setMessage({ type: 'error', text: `Failed to delete account: ${error.message}` });
      }
      setLoading(prev => ({ ...prev, deleteAccount: false }));
    }
    // setLoading state is handled by auth state change on success
  };

  // --- Name Editing Handlers ---
  const handleEditName = () => {
    setIsEditingName(true);
    setMessage({ type: '', text: '' }); // Clear messages
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setDisplayName(activeUser?.displayName || ''); // Reset to original name
    setMessage({ type: '', text: '' }); // Clear messages
  };

  const handleSaveName = async () => {
    if (!auth?.currentUser) {
        setMessage({ type: 'error', text: 'Cannot update name: User not properly authenticated.' });
        return;
    }
    if (displayName.trim() === (activeUser?.displayName || '')) {
        // No change, just exit editing mode
        setIsEditingName(false);
        return;
    }

    setLoading(prev => ({ ...prev, updateName: true }));
    setMessage({ type: '', text: '' });

    try {
        await updateProfile(auth.currentUser, { displayName: displayName.trim() });
        updateActiveUser({ displayName: displayName.trim() }); // Update context state
        setMessage({ type: 'success', text: 'Display name updated.' });
        setIsEditingName(false); // Exit editing mode on success
    } catch (error) {
        console.error("Update Name Error:", error);
        setMessage({ type: 'error', text: `Failed to update display name: ${error.message}` });
    } finally {
        setLoading(prev => ({ ...prev, updateName: false }));
    }
  };
  // --- End Name Editing Handlers ---

  // Renamed original function - now just handles file selection and initiates cropping
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Basic validation before showing cropper
      const MAX_SIZE_MB = 5; // Allow slightly larger file before crop
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

      if (file.size > MAX_SIZE_BYTES) {
        setMessage({ type: 'error', text: `File is too large. Max size before crop is ${MAX_SIZE_MB}MB.` });
        e.target.value = null;
        return;
      }
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Invalid file type. Please upload an image.' });
        e.target.value = null;
        return;
      }

      setCrop(undefined); // Reset crop when new file is selected
      setCompletedCrop(undefined);
      setOriginalFile(file); // Store original file info

      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImageSrc(reader.result?.toString() || ''),
      );
      reader.readAsDataURL(file);
      setMessage({ type: '', text: '' }); // Clear previous messages
    }
     // Reset file input value here so the same file can be selected again if needed after cancelling crop
     e.target.value = null;
  };

  // Called when the image is loaded in the cropper
  function onImageLoad(e) {
    imgRef.current = e.currentTarget; // Store image ref
    const { width, height } = e.currentTarget;
    // Set initial centered crop based on aspect ratio
    setCrop(centerAspectCrop(width, height, aspect));
  }

  // Function to handle the final upload after cropping
  const uploadCroppedImage = async () => {
    // ---> Log completedCrop <---
    // console.log("Uploading cropped image with completedCrop:", completedCrop);

    if (!completedCrop || !imgRef.current || !originalFile || completedCrop.width === 0 || completedCrop.height === 0) {
       // Added check for zero dimensions in crop
      console.error("Cropping failed - invalid crop dimensions:", completedCrop);
      setMessage({ type: 'error', text: 'Cropping failed. Please select a valid area.' });
      return;
    }

    setLoading(prev => ({ ...prev, uploadPic: true }));
    setMessage({ type: '', text: '' });
    const oldPhotoURL = auth.currentUser?.photoURL;

    try {
      // ---> Call the updated getCroppedImg <---
      const croppedBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        originalFile.name,
        originalFile.type
      );

      // ... rest of the upload logic remains the same ...
      if (!auth.currentUser) {
        throw new Error("Authentication lost. Please try again.");
      }

      // ---> Use the blob's name (which might now be .jpeg) for the storage path <---
      const storageFileName = croppedBlob.name || originalFile.name; // Fallback just in case
      // console.log(`Using storage file name: ${storageFileName}`);
      const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}/${storageFileName}`);

      const snapshot = await uploadBytes(storageRef, croppedBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      if (!auth.currentUser) {
        throw new Error("User session ended before profile update.");
      }
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      updateActiveUser({ photoURL: downloadURL });

      setMessage({ type: 'success', text: 'Profile picture updated.' });

      if (oldPhotoURL && oldPhotoURL.includes('firebasestorage.googleapis.com')) {
        try {
          const oldStorageRef = ref(storage, oldPhotoURL);
          await deleteObject(oldStorageRef);
        } catch (deleteError) {
          console.error("Failed to delete old profile picture:", deleteError);
        }
      }

      setImageSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
      setOriginalFile(null);

    } catch (error) {
      console.error("Profile Pic Upload Error:", error);
      // Display the specific error from getCroppedImg or upload
      setMessage({ type: 'error', text: `Failed to upload profile picture: ${error.message}` });
    } finally {
      setLoading(prev => ({ ...prev, uploadPic: false }));
    }
  };

  const handleCancelCrop = () => {
      setImageSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
      setOriginalFile(null);
      setMessage({ type: '', text: '' }); // Clear any messages
  }

  const currentPhotoURL = activeUser?.photoURL;
  // Update isActionDisabled to include updateName loading state
  const isActionDisabled = !activeUser || !auth?.currentUser || loading.deleteAccount || loading.resetPassword || loading.uploadPic || loading.updateName;

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Account Settings</DialogTitle>
        <DialogContent dividers>
          {message.text && <Alert severity={message.type || 'info'} sx={{ mb: 2 }}>{message.text}</Alert>}

          {/* --- Conditional Rendering: Show Cropper or Standard View --- */}
          {imageSrc ? (
            // --- Cropper View ---
            <Stack spacing={2} alignItems="center">
               <Typography variant="body2" color="textSecondary" sx={{mb: 1}}>Crop your image</Typography>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                // minWidth={100} // Optional: minimum pixel size
                // minHeight={100}
                // circularCrop // Optional: if you want a circle preview
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imageSrc}
                  onLoad={onImageLoad}
                  style={{ maxHeight: '70vh' }} // Limit height in modal
                />
              </ReactCrop>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                 <Button onClick={handleCancelCrop} disabled={loading.uploadPic}>Cancel</Button>
                 <Button
                    variant="contained"
                    onClick={uploadCroppedImage}
                    disabled={!completedCrop || loading.uploadPic}
                    startIcon={loading.uploadPic ? <CircularProgress size={20} /> : null}
                 >
                    {loading.uploadPic ? 'Saving...' : 'Save Crop'}
                 </Button>
              </Stack>
            </Stack>
          ) : (
            // --- Standard View ---
            <Stack spacing={2} sx={{ mt: 1 }}>
              {/* Display Name Field */}
              <TextField
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!isEditingName || loading.updateName}
                fullWidth
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {isEditingName ? (
                        <>
                          <IconButton
                            aria-label="cancel name edit"
                            onClick={handleCancelEditName}
                            edge="end"
                            disabled={loading.updateName}
                          >
                            <CancelIcon />
                          </IconButton>
                          <IconButton
                            aria-label="save display name"
                            onClick={handleSaveName}
                            edge="end"
                            disabled={loading.updateName || !displayName.trim()} // Disable save if name is empty/whitespace
                            color="primary"
                          >
                            {loading.updateName ? <CircularProgress size={24} /> : <SaveIcon />}
                          </IconButton>
                        </>
                      ) : (
                        <IconButton
                          aria-label="edit display name"
                          onClick={handleEditName}
                          edge="end"
                          disabled={isActionDisabled} // Disable if other actions are loading
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Email"
                value={activeUser?.email || ''}
                disabled
                fullWidth
                variant="outlined"
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={currentPhotoURL || undefined}
                  sx={{ width: 56, height: 56 }}
                >
                  {!currentPhotoURL && activeUser?.email ? activeUser.email[0].toUpperCase() : null}
                </Avatar>
                <label htmlFor="profile-pic-upload">
                  <input
                    accept="image/*"
                    id="profile-pic-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={onSelectFile} // Changed to onSelectFile
                    disabled={!activeUser || !auth?.currentUser}
                  />
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    disabled={!activeUser || !auth?.currentUser}
                  >
                    Change Picture
                  </Button>
                </label>
              </Box>

              {/* Wrap the two buttons in a nested Stack */}
              <Stack spacing={1}> {/* Adjust spacing here as needed */}
                <Button
                  variant="outlined"
                  onClick={handleResetPassword}
                  disabled={isActionDisabled || !activeUser?.email}
                  startIcon={loading.resetPassword ? <CircularProgress size={20} /> : null}
                >
                  {loading.resetPassword ? 'Sending...' : 'Send Password Reset Email'}
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={isActionDisabled}
                  startIcon={loading.deleteAccount ? <CircularProgress size={20} /> : null}
                  // sx={{ mt: -1 }} // Remove negative margin
                >
                  {loading.deleteAccount ? 'Deleting...' : 'Delete Account'}
                </Button>
              </Stack>
            </Stack>
          )}
          {/* --- End Conditional Rendering --- */}

        </DialogContent>
        <DialogActions>
          {/* Disable close button while cropping/uploading/saving name */}
          <Button onClick={onClose} disabled={loading.deleteAccount || loading.uploadPic || !!imageSrc || loading.updateName}>Close</Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={setDeleteConfirmOpen}
        onConfirm={handleDeleteAccount}
        title="Confirm Account Deletion"
        message="Are you sure you want to permanently delete your account? This action cannot be undone."
      />
    </>
  );
}
