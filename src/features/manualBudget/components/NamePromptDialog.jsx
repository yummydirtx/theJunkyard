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

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from '@mui/material';

/**
 * NamePromptDialog is a modal dialog that prompts new users to enter their name
 * when they first access the Manual Budget feature.
 * @param {object} props - The component's props.
 * @param {boolean} props.open - Controls the visibility of the dialog.
 * @param {string} props.nameInput - The current value of the name input field.
 * @param {function} props.onNameInputChange - Callback function to handle changes to the name input.
 * @param {function} props.onSubmitName - Callback function to handle the submission of the name.
 * @param {boolean} props.loading - Indicates if the name submission is in progress.
 */
export default function NamePromptDialog({
    open,
    nameInput,
    onNameInputChange,
    onSubmitName,
    loading
}) {
    return (
        <Dialog open={open} onClose={() => { /* Prevent closing by backdrop click or Escape key */ }}>
            <DialogTitle>Welcome to Manual Budget</DialogTitle>
            <DialogContent>
                <Typography gutterBottom>
                    Please enter your name to get started:
                </Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Your Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={nameInput}
                    onChange={onNameInputChange}
                    disabled={loading}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onSubmitName}
                    variant="contained"
                    color="primary"
                    disabled={!nameInput.trim() || loading}
                >
                    {loading ? "Saving..." : "Start Budgeting"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}