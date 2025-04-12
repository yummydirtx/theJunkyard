import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

function ProfileMenu({ user, openLoginModal, openSignUpModal, handleSignOut, sx = {} }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton 
        onClick={handleProfileMenuOpen} 
        sx={{ p: 0, mr: 1, borderRadius: '50%' }} // modified: added borderRadius and margin here
      >
        <Avatar
          src={(user && user.photoURL) ? user.photoURL : "https://via.placeholder.com/40"}
          alt="profile"
          sx={{ width: 32, height: 32 }} // removed margin from here
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {user ? (
          <MenuItem onClick={() => { handleMenuClose(); handleSignOut(); }}>Sign Out</MenuItem>
        ) : (
          <>
            <MenuItem onClick={() => { handleMenuClose(); openLoginModal(); }}>Log In</MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); openSignUpModal(); }}>Sign Up</MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}

export default ProfileMenu;
