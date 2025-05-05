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

// Style for the modal (copied from ExpenseList.jsx)
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh',
  overflowY: 'auto',
};

/**
 * Modal to display itemized details of an expense.
 * @param {object} props
 * @param {boolean} props.open - Whether the modal is open.
 * @param {function} props.onClose - Function to call when closing the modal.
 * @param {Array<object>} props.items - Array of item objects ({ description, price }).
 */
export default function ExpenseItemsModal({ open, onClose, items = [] }) {
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
                                        primary={item.description || '(No description)'}
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
