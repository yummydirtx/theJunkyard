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

import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { CircularProgress, IconButton, InputAdornment, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Component for Display Name Editing
export default function DisplayNameSection({
  initialName,
  onSave,
  loading,
  disabled,
}) {
  const [displayName, setDisplayName] = useState(initialName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const { activeUser } = useAuth(); // Get activeUser to reset name on cancel

  useEffect(() => {
    // Reset editing state and name if the initialName changes (e.g., user logs out/in)
    // or if the component is no longer disabled (modal might have been closed and reopened)
    if (!disabled) {
        setDisplayName(initialName || '');
        setIsEditingName(false);
    }
  }, [initialName, disabled]);

  const handleEdit = () => setIsEditingName(true);
  const handleCancel = () => {
    setIsEditingName(false);
    setDisplayName(activeUser?.displayName || ''); // Reset to original name from context/initial
  };
  const handleSave = () => {
    onSave(displayName.trim()); // Pass trimmed name to parent handler
    // Parent component handles setting loading state and potentially exiting edit mode on success/fail
    // setIsEditingName(false); // Let parent decide when to exit edit mode based on save result
  };

  // Update isEditingName based on loading state from parent
  useEffect(() => {
      if (!loading && isEditingName && displayName.trim() === (activeUser?.displayName || '')) {
          // If loading finished and name hasn't changed or was saved successfully (parent updated initialName)
          // Exit editing mode automatically
          // This might need adjustment based on how parent handles success/failure
          // setIsEditingName(false);
      }
  }, [loading, isEditingName, displayName, activeUser?.displayName]);


  return (
    <TextField
      label="Display Name"
      value={displayName}
      onChange={(e) => setDisplayName(e.target.value)}
      disabled={!isEditingName || loading}
      fullWidth
      variant="outlined"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {isEditingName ? (
              <>
                <IconButton
                  aria-label="cancel name edit"
                  onClick={handleCancel}
                  edge="end"
                  disabled={loading}
                >
                  <CancelIcon />
                </IconButton>
                <IconButton
                  aria-label="save display name"
                  onClick={handleSave}
                  edge="end"
                  disabled={loading || !displayName.trim() || displayName.trim() === (activeUser?.displayName || '')}
                  color="primary"
                >
                  {loading ? <CircularProgress size={24} /> : <SaveIcon />}
                </IconButton>
              </>
            ) : (
              <IconButton
                aria-label="edit display name"
                onClick={handleEdit}
                edge="end"
                disabled={disabled} // Disable edit button if parent says so
              >
                <EditIcon />
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
    />
  );
}
