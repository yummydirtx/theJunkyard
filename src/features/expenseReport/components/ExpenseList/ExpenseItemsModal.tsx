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
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { ExpenseItem } from '../../types';

// Style for the modal
const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh',
  overflowY: 'auto' as const,
};

interface ExpenseItemsModalProps {
  open: boolean;
  onClose: () => void;
  items?: ExpenseItem[];
}

/**
 * Modal to display itemized details of an expense.
 */
export default function ExpenseItemsModal({ open, onClose, items = [] }: ExpenseItemsModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="expense-items-modal-title"
            aria-describedby="expense-items-modal-description"
        >
            <Box sx={modalStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography id="expense-items-modal-title" variant="h6" component="h2">
                        Expense Items
                    </Typography>
                    <IconButton onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <List dense id="expense-items-modal-description">
                    {items.length > 0 ? (
                        items.map((item, index) => (
                            <React.Fragment key={index}>
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary={item.description || item.name || '(No description)'}
                                        secondary={item.price !== undefined ? `$${item.price.toFixed(2)}` : null}
                                    />
                                </ListItem>
                                {index < items.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="No item details available." />
                        </ListItem>
                    )}
                </List>
            </Box>
        </Modal>
    );
}
