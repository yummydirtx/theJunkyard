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

import { sendPasswordResetEmail, updateProfile, deleteUser } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getCroppedImg, centerAspectCrop } from '../../utils/imageUtils'; // Assuming imageUtils are in src/utils

// --- Handler Functions ---

export const handleResetPassword = async ({ auth, activeUser, setLoading, setMessage }) => {
  if (!activeUser?.email || !auth?.currentUser) {
    setMessage({ type: 'error', text: 'Cannot send reset email: User or email not found.' });
    return;
  }
  setLoading(prev => ({ ...prev, resetPassword: true }));
  setMessage({ type: '', text: '' });
  try {
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

export const handleDeleteAccount = async ({ auth, setLoading, setMessage, setDeleteConfirmOpen }) => {
  if (!auth?.currentUser) {
    setMessage({ type: 'error', text: 'Cannot delete account: User not properly authenticated.' });
    setDeleteConfirmOpen(false);
    return;
  }
  setLoading(prev => ({ ...prev, deleteAccount: true }));
  setMessage({ type: '', text: '' });
  try {
    await deleteUser(auth.currentUser);
    setDeleteConfirmOpen(false);
    // Auth state change will handle UI updates/modal closure
  } catch (error) {
    console.error("Delete Account Error:", error);
    let errorMsg = `Failed to delete account: ${error.message}`;
    if (error.code === 'auth/requires-recent-login') {
      errorMsg = 'This operation requires recent login. Please sign out, sign back in, and try again.';
    }
    setMessage({ type: 'error', text: errorMsg });
    setLoading(prev => ({ ...prev, deleteAccount: false }));
    setDeleteConfirmOpen(false); // Ensure dialog closes on error too
  }
  // No finally block for loading state on success, as component might unmount
};

export const handleSaveName = async ({ newName, auth, activeUser, updateActiveUser, setLoading, setMessage }) => {
  if (!auth?.currentUser) {
    setMessage({ type: 'error', text: 'Cannot update name: User not properly authenticated.' });
    return;
  }
  if (newName === (activeUser?.displayName || '')) {
    // Optionally add an info message if desired
    // setMessage({ type: 'info', text: 'Display name is already set to this value.' });
    return; // No change
  }

  setLoading(prev => ({ ...prev, updateName: true }));
  setMessage({ type: '', text: '' });

  try {
    await updateProfile(auth.currentUser, { displayName: newName });
    updateActiveUser({ displayName: newName }); // Update context state
    setMessage({ type: 'success', text: 'Display name updated.' });
  } catch (error) {
    console.error("Update Name Error:", error);
    setMessage({ type: 'error', text: `Failed to update display name: ${error.message}` });
  } finally {
    setLoading(prev => ({ ...prev, updateName: false }));
  }
};

export const onSelectFile = (e, { setCrop, setCompletedCrop, setOriginalFile, setMessage, setImageSrc }) => {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    const MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    if (file.size > MAX_SIZE_BYTES) {
      setMessage({ type: 'error', text: `File is too large. Max size before crop is ${MAX_SIZE_MB}MB.` });
      return;
    }
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Invalid file type. Please upload an image.' });
      return;
    }

    setCrop(undefined);
    setCompletedCrop(undefined);
    setOriginalFile(file);
    setMessage({ type: '', text: '' });

    const reader = new FileReader();
    reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || ''));
    reader.readAsDataURL(file);
  }
};

export function onImageLoad(e, { imgRef, aspect, setCrop }) {
  imgRef.current = e.currentTarget;
  const { width, height } = e.currentTarget;
  // Ensure aspect is defined before calling centerAspectCrop
  if (typeof aspect === 'number') {
      setCrop(centerAspectCrop(width, height, aspect));
  } else {
      console.error("Aspect ratio is not defined for cropping.");
      // Handle error appropriately, maybe set a default crop or show an error message
  }
}

export const uploadCroppedImage = async ({ completedCrop, imgRef, originalFile, auth, storage, updateActiveUser, setLoading, setMessage, setImageSrc, setCrop, setCompletedCrop, setOriginalFile }) => {
  if (!completedCrop || !imgRef.current || !originalFile || completedCrop.width === 0 || completedCrop.height === 0) {
    console.error("Cropping failed - invalid crop dimensions or missing data:", completedCrop, originalFile);
    setMessage({ type: 'error', text: 'Cropping failed. Please select a valid area.' });
    return;
  }

  setLoading(prev => ({ ...prev, uploadPic: true }));
  setMessage({ type: '', text: '' });
  const oldPhotoURL = auth.currentUser?.photoURL;

  try {
    const croppedBlob = await getCroppedImg(
      imgRef.current,
      completedCrop,
      originalFile.name,
      originalFile.type
    );

    if (!auth.currentUser) throw new Error("Authentication lost. Please try again.");

    const storageFileName = croppedBlob.name || `${originalFile.name.split('.')[0]}.jpeg`;
    const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}/${storageFileName}`);

    const snapshot = await uploadBytes(storageRef, croppedBlob);
    const downloadURL = await getDownloadURL(snapshot.ref);

    if (!auth.currentUser) throw new Error("User session ended before profile update.");

    await updateProfile(auth.currentUser, { photoURL: downloadURL });
    updateActiveUser({ photoURL: downloadURL });

    setMessage({ type: 'success', text: 'Profile picture updated.' });

    // Delete old picture if it exists and is from Firebase Storage
    if (oldPhotoURL && oldPhotoURL.includes('firebasestorage.googleapis.com')) {
      if (oldPhotoURL !== downloadURL) { // Avoid deleting if the URL is the same
          try {
              const oldStorageRef = ref(storage, oldPhotoURL);
              await deleteObject(oldStorageRef);
          } catch (deleteError) {
              console.warn("Failed to delete old profile picture:", deleteError);
          }
      }
    }

    // Reset cropping state
    setImageSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setOriginalFile(null);

  } catch (error) {
    console.error("Profile Pic Upload Error:", error);
    setMessage({ type: 'error', text: `Failed to upload profile picture: ${error.message}` });
  } finally {
    setLoading(prev => ({ ...prev, uploadPic: false }));
  }
};

export const handleCancelCrop = ({ setImageSrc, setCrop, setCompletedCrop, setOriginalFile, setMessage }) => {
  setImageSrc('');
  setCrop(undefined);
  setCompletedCrop(undefined);
  setOriginalFile(null);
  setMessage({ type: '', text: '' });
};
