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
async function getCroppedImg(
  image,
  pixelCrop,
  fileName,
  fileType = 'image/png' // Add fileType parameter with fallback
) {
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  // Adjust for device pixel ratio
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(pixelCrop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(pixelCrop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = pixelCrop.x * scaleX;
  const cropY = pixelCrop.y * scaleY;

  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY);
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY);
  // 3) Rotate around the origin
  // ctx.rotate(rotate * Math.PI / 180); // Rotation not implemented here
  // 2) Scale the image
  // ctx.scale(scale, scale); // Scale not implemented here
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY);

  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        blob.name = fileName; // Add filename property to blob
        resolve(blob);
      },
      fileType, // Use the passed fileType
      0.85 // Adjust quality slightly lower, effective mainly for JPEG
    );
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
    if (!completedCrop || !imgRef.current || !originalFile) {
      setMessage({ type: 'error', text: 'Cropping failed. Please try again.' });
      return;
    }

    setLoading(prev => ({ ...prev, uploadPic: true }));
    setMessage({ type: '', text: '' });
    const oldPhotoURL = auth.currentUser?.photoURL; // Get old URL before upload

    try {
      const croppedBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        originalFile.name, // Pass original filename
        originalFile.type // Pass original file type
      );

      // --- Validation on Cropped Blob ---
      const MAX_CROPPED_SIZE_MB = 1;
      const MAX_CROPPED_SIZE_BYTES = MAX_CROPPED_SIZE_MB * 1024 * 1024;
      if (croppedBlob.size > MAX_CROPPED_SIZE_BYTES) {
          throw new Error(`Cropped image is too large. Maximum size is ${MAX_CROPPED_SIZE_MB}MB.`);
      }
      // --- End Validation ---


      if (!auth.currentUser) {
        throw new Error("Authentication lost. Please try again.");
      }

      const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}/${originalFile.name}`); // Use original file name or generate a new one

      const snapshot = await uploadBytes(storageRef, croppedBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      if (!auth.currentUser) {
        throw new Error("User session ended before profile update.");
      }
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      updateActiveUser({ photoURL: downloadURL });

      setMessage({ type: 'success', text: 'Profile picture updated.' });

      // Delete old picture if exists
      if (oldPhotoURL && oldPhotoURL.includes('firebasestorage.googleapis.com')) {
        try {
          const oldStorageRef = ref(storage, oldPhotoURL);
          await deleteObject(oldStorageRef);
        } catch (deleteError) {
          console.error("Failed to delete old profile picture:", deleteError);
        }
      }

      // Reset cropper state on success
      setImageSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
      setOriginalFile(null);

    } catch (error) {
      console.error("Profile Pic Upload Error:", error);
      if (error.code?.includes('storage/')) {
        setMessage({ type: 'error', text: 'Upload failed. Check permissions or network connection.' });
      } else {
        setMessage({ type: 'error', text: `Failed to upload profile picture: ${error.message}` });
      }
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
               <Typography variant="body2" color="textSecondary" sx={{mb: 1}}>Crop your image (must be square)</Typography>
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
            <Stack spacing={3} sx={{ mt: 1 }}>
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
