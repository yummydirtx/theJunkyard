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

// Import Sub-components
import DisplayNameSection from './AccountSettings/DisplayNameSection';
import ProfilePictureSection from './AccountSettings/ProfilePictureSection';
import ImageCropperView from './AccountSettings/ImageCropperView';
import AccountActionsSection from './AccountSettings/AccountActionsSection';

// Import Handler Functions
import {
  handleResetPassword,
  handleDeleteAccount,
  handleSaveName,
  onSelectFile,
  onImageLoad,
  uploadCroppedImage,
  handleCancelCrop
} from './AccountSettings/accountSettingsHandlers';

// --- Main Modal Component ---

export default function AccountSettingsModal({ open, onClose }) {
  const { activeUser, auth, app, updateActiveUser } = useAuth();
  const storage = getStorage(app);

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState({
    resetPassword: false,
    deleteAccount: false,
    uploadPic: false,
    updateName: false,
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Cropping State
  const [imageSrc, setImageSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [aspect, setAspect] = useState(1 / 1);
  const imgRef = useRef(null);
  const [originalFile, setOriginalFile] = useState(null);

  // Reset state when modal opens
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

  // Effect to clear message when user changes while modal is open
  useEffect(() => {
      if (open) {
          setMessage({ type: '', text: '' });
      }
  }, [activeUser, open]);

  // Prepare arguments object for handlers
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

  const anyLoading = Object.values(loading).some(Boolean);
  const isActionDisabled = !activeUser || !auth?.currentUser || anyLoading;
  const isCloseDisabled = loading.deleteAccount || loading.uploadPic || !!imageSrc || loading.updateName;

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
