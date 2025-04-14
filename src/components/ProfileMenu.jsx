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

import { useState } from 'react'; // Removed useContext
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
// Removed ListItemText, AddCircleOutlineIcon
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings'; // For Account Settings
import AccountSettingsModal from './AccountSettingsModal'; // Keep for settings modal
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

// Removed openLoginModal, openSignUpModal props
export default function ProfileMenu({ sx = {} }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

    // Get state and the single signOut function from context
    // Removed loggedInUsers, switchActiveUser, signOutUser, signOutAll
    const { activeUser, signOut, loading } = useAuth();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // Removed handleSwitchAccount, handleAddAccount, handleSignOutCurrent, handleSignOutAll

    // Simplified sign out handler
    const handleSignOut = () => {
        signOut(); // Call the signOut function from context
        handleClose();
    };

    const openAccountSettings = () => {
        setAccountSettingsOpen(true);
        handleClose();
    };

    // Don't render the button if loading or no active user
    if (loading || !activeUser) {
        return null;
    }

    return (
        <>
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ...sx, ml: 1, mr: 1 }} // Apply sx props, ensure some margin if needed
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                {/* ... Avatar rendering ... */}
                <Avatar
                    src={activeUser.photoURL || undefined}
                    alt={activeUser.displayName || activeUser.email || 'User'}
                    sx={{ width: 32, height: 32 }}
                >
                    {/* Fallback initial */}
                    {!activeUser.photoURL && activeUser.email ? activeUser.email[0].toUpperCase() : ''}
                </Avatar>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                // onClick={handleClose} // Might close menu prematurely when clicking items
                // Replace PaperProps with slotProps.paper
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: (theme) => ({ // Use theme function for access to palette
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            minWidth: 180, // Adjusted width
                            borderRadius: '8px', // Keep border radius
                            border: '1px solid', // Add border
                            borderColor: theme.palette.divider, // Use theme divider color
                            // ... other PaperProps sx ...
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            // Arrow styles (optional)
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                                // Add border to the arrow as well to match
                                borderLeft: `1px solid ${theme.palette.divider}`,
                                borderTop: `1px solid ${theme.palette.divider}`,
                            },
                        }),
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* Removed logged-in users list */}
                {/* Display current user info (optional) */}
                 <MenuItem disabled sx={{ opacity: '1 !important' }}>
                     <ListItemIcon>
                         <Avatar src={activeUser.photoURL || undefined} sx={{ width: 28, height: 28 }}>
                            {!activeUser.photoURL && activeUser.email ? activeUser.email[0].toUpperCase() : ''}
                         </Avatar>
                     </ListItemIcon>
                     {activeUser.displayName || activeUser.email}
                 </MenuItem>
                 <Divider sx={{ my: 0.5 }} />

                {/* Simplified Actions */}
                {/* Removed Add Account */}
                <MenuItem onClick={openAccountSettings}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Account Settings
                </MenuItem>
                 {/* Removed Sign out current and Sign out all */}
                 <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Sign out
                </MenuItem>
            </Menu>

            {/* Account Settings Modal */}
            {/* ... AccountSettingsModal rendering ... */}
            <AccountSettingsModal
                open={accountSettingsOpen}
                onClose={() => setAccountSettingsOpen(false)}
                user={activeUser} // Pass the currently active user to the settings modal
                // Pass app or db if the modal needs them directly
            />
        </>
    );
}
