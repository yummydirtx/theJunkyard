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

import React, { useState } from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountSettingsModal from '../../features/authentication/components/AccountSettingsModal';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Props for the ProfileMenu component.
 */
interface ProfileMenuProps {
    /** Custom styles to be applied to the IconButton. */
    sx?: SxProps<Theme>;
}

/**
 * ProfileMenu component displays an avatar icon button that, when clicked,
 * opens a menu with options for account settings and signing out.
 * It relies on `AuthContext` to get the active user's information and sign-out functionality.
 */
export default function ProfileMenu({ sx = {} }: ProfileMenuProps) {
    /** The DOM element that the menu is anchored to. */
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    /** Controls the visibility of the AccountSettingsModal. */
    const [accountSettingsOpen, setAccountSettingsOpen] = useState<boolean>(false);

    const { activeUser, signOut, loading } = useAuth();

    /**
     * Handles the click event on the avatar button to open the profile menu.
     * @param event - The click event.
     */
    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    /**
     * Handles closing the profile menu.
     */
    const handleClose = (): void => {
        setAnchorEl(null);
    };

    /**
     * Handles the sign-out action. It calls the `signOut` function from `AuthContext`
     * and closes the profile menu.
     */
    const handleSignOut = (): void => {
        signOut();
        handleClose();
    };

    /**
     * Opens the Account Settings modal and closes the profile menu.
     */
    const openAccountSettings = (): void => {
        setAccountSettingsOpen(true);
        handleClose();
    };

    // Do not render the menu if authentication is loading or no user is active.
    if (loading || !activeUser) {
        return null;
    }

    return (
        <>
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ...sx, ml: 1, mr: 1 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                <Avatar
                    src={activeUser.photoURL || undefined}
                    alt={activeUser.displayName || activeUser.email || 'User'}
                    sx={{ width: 32, height: 32 }}
                >
                    {/* Fallback to the first letter of the email if no photoURL is available. */}
                    {!activeUser.photoURL && activeUser.email ? activeUser.email[0].toUpperCase() : ''}
                </Avatar>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: (theme: Theme) => ({
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            minWidth: 180,
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: theme.palette.divider,
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
                 {/* Displays the current active user's avatar and email/name. This item is disabled. */}
                 <MenuItem disabled sx={{ opacity: '1 !important' }}>
                     <ListItemIcon>
                         <Avatar src={activeUser.photoURL || undefined} sx={{ width: 28, height: 28 }}>
                            {!activeUser.photoURL && activeUser.email ? activeUser.email[0].toUpperCase() : ''}
                         </Avatar>
                     </ListItemIcon>
                     {activeUser.displayName || activeUser.email}
                 </MenuItem>
                 <Divider sx={{ my: 0.5 }} />

                <MenuItem onClick={openAccountSettings}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Account Settings
                </MenuItem>
                 <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Sign out
                </MenuItem>
            </Menu>

            <AccountSettingsModal
                open={accountSettingsOpen}
                onClose={() => setAccountSettingsOpen(false)}
            />
        </>
    );
}
