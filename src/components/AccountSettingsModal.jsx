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
  Alert,
  Stack,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getStorage } from "firebase/storage";
import ConfirmationDialog from './ConfirmationDialog';
import 'react-image-crop/dist/ReactCrop.css';

// Sub-components for different sections of the modal
import DisplayNameSection from './AccountSettings/DisplayNameSection';
import ProfilePictureSection from './AccountSettings/ProfilePictureSection';
import ImageCropperView from './AccountSettings/ImageCropperView';
import AccountActionsSection from './AccountSettings/AccountActionsSection';

// Handler functions for account actions
import {
  handleResetPassword,
  handleDeleteAccount,
  handleSaveName,
  onSelectFile,
  onImageLoad,
  uploadCroppedImage,
  handleCancelCrop
} from './AccountSettings/accountSettingsHandlers';

/**
 * AccountSettingsModal provides a dialog for users to manage their account settings,
 * including display name, profile picture, password reset, and account deletion.
 * @param {object} props - The component's props.
 * @param {boolean} props.open - Controls the visibility of the modal.
 * @param {function} props.onClose - Callback function to close the modal.
 */
export default function AccountSettingsModal({ open, onClose }) {
  const { activeUser, auth, app, updateActiveUser } = useAuth();
  const storage = getStorage(app);

  /** @state {{type: string, text: string}} message - Holds messages (e.g., success, error) to display to the user. */
  const [message, setMessage] = useState({ type: '', text: '' });
  /** @state {object} loading - Tracks loading states for various asynchronous actions. */
  const [loading, setLoading] = useState({
    resetPassword: false,
    deleteAccount: false,
    uploadPic: false,
    updateName: false,
  });
  /** @state {boolean} deleteConfirmOpen - Controls the visibility of the account deletion confirmation dialog. */
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // State for image cropping functionality
  /** @state {string} imageSrc - Base64 source of the image selected for cropping. */
  const [imageSrc, setImageSrc] = useState('');
  /** @state {object} crop - Current crop selection parameters. */
  const [crop, setCrop] = useState();
  /** @state {object} completedCrop - Final crop parameters after user interaction. */
  const [completedCrop, setCompletedCrop] = useState();
  /** @state {number} aspect - Aspect ratio for the crop (e.g., 1/1 for square). */
  const [aspect, setAspect] = useState(1 / 1);
  /** @ref {object} imgRef - Reference to the image element used in the cropper. */
  const imgRef = useRef(null);
  /** @state {File|null} originalFile - The original file object selected by the user. */
  const [originalFile, setOriginalFile] = useState(null);

  // Effect to reset modal-specific state when the modal is opened.
  useEffect(() => {
    if (open) {
        setMessage({ type: '', text: '' });
        setImageSrc('');
        setCrop(undefined);
        setCompletedCrop(undefined);
        setOriginalFile(null);
        setLoading({
            resetPassword: false,
            deleteAccount: false,
            uploadPic: false,
            updateName: false,
        });
        setDeleteConfirmOpen(false);
    }
  }, [open]);

  // Effect to clear any displayed messages if the active user changes while the modal is open.
  // This prevents showing messages relevant to a previous user session.
  useEffect(() => {
      if (open) {
          setMessage({ type: '', text: '' });
      }
  }, [activeUser, open]);

  // Consolidates arguments passed to handler functions for cleaner invocation.
  const handlerArgs = {
    auth,
    activeUser,
    app,
    storage,
    updateActiveUser,
    setLoading,
    setMessage,
    setDeleteConfirmOpen,
    setImageSrc,
    setCrop,
    setCompletedCrop,
    setOriginalFile,
    imgRef,
    aspect,
    crop,
    completedCrop,
    originalFile,
  };

  // Determines if any loading operation is currently in progress.
  const anyLoading = Object.values(loading).some(Boolean);
  // Determines if action buttons should be disabled (e.g., no user, or an operation is loading).
  const isActionDisabled = !activeUser || !auth?.currentUser || anyLoading;
  // Determines if the close button should be disabled (e.g., during critical operations or when cropper is active).
  const isCloseDisabled = loading.deleteAccount || loading.uploadPic || !!imageSrc || loading.updateName;

  /**
   * Handles closing the modal, but only if no critical operations are in progress.
   */
  const handleCloseModal = () => {
      if (!isCloseDisabled) {
          onClose();
      }
  }

  return (
    <>
      <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="xs">
        <DialogTitle>Account Settings</DialogTitle>
        <DialogContent dividers>
          {message.text && <Alert severity={message.type || 'info'} sx={{ mb: 2 }}>{message.text}</Alert>}

          {imageSrc ? (
            <ImageCropperView
              imageSrc={imageSrc}
              crop={crop}
              onCropChange={setCrop}
              onCropComplete={setCompletedCrop}
              aspect={aspect}
              onImageLoad={(e) => onImageLoad(e, handlerArgs)}
              imgRef={imgRef}
              onSaveCrop={() => uploadCroppedImage(handlerArgs)}
              onCancelCrop={() => handleCancelCrop(handlerArgs)}
              loading={loading.uploadPic}
            />
          ) : (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <DisplayNameSection
                initialName={activeUser?.displayName}
                onSave={(newName) => handleSaveName({ ...handlerArgs, newName })}
                loading={loading.updateName}
                disabled={isActionDisabled && !loading.updateName}
              />

              <TextField
                label="Email"
                value={activeUser?.email || ''}
                disabled
                fullWidth
                variant="outlined"
              />

              <ProfilePictureSection
                currentPhotoURL={activeUser?.photoURL}
                email={activeUser?.email}
                onFileSelect={(e) => onSelectFile(e, handlerArgs)}
                disabled={isActionDisabled}
              />

              <AccountActionsSection
                onResetPassword={() => handleResetPassword(handlerArgs)}
                onDeleteAccount={() => setDeleteConfirmOpen(true)}
                loadingReset={loading.resetPassword}
                loadingDelete={loading.deleteAccount}
                disabled={isActionDisabled}
                email={activeUser?.email}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={isCloseDisabled}>Close</Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => handleDeleteAccount(handlerArgs)}
        title="Confirm Account Deletion"
        message="Are you sure you want to permanently delete your account? This action cannot be undone."
      />
    </>
  );
}
