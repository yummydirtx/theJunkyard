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

import React, { useState, useContext } from 'react'; // Import useContext
import PropTypes from 'prop-types';
// Remove Firebase auth imports handled by context
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ToggleColorMode from './ToggleColorMode';
import LoginModal from './Authentication/LoginModal';
import SignUpModal from './Authentication/SignUpModal';
import logo from '../assets/websitelogo.png';
import useModal from '../hooks/useModal';
import ProfileMenu from './ProfileMenu'; // Use the updated ProfileMenu
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const logoStyle = {
  width: '150px',
  height: 'auto',
  cursor: 'pointer',
};

function AppAppBar({ mode, toggleColorMode, app }) { // app might not be needed directly anymore
  const [open, setOpen] = useState(false);
  const { activeUser, loading, db } = useAuth(); // Get user and loading state from context
  // const db = getFirestore(app); // Get db from context if needed, or directly

  const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
  const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);

  // Remove useEffect for onAuthStateChanged - context handles this

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  // Remove handleSignOut - context handles this via ProfileMenu

  const handleThemeChange = async () => {
    toggleColorMode();
    // Use activeUser from context
    if (activeUser) {
      try {
        const newMode = mode === 'light' ? 'dark' : 'light';
        // Ensure db is available from context or props
        if (db) {
            await setDoc(doc(db, 'userPreferences', activeUser.uid), {
              theme: newMode
            }, { merge: true });
        } else {
            console.warn("Firestore instance (db) not available in AppAppBar for theme saving.");
        }
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    }
  };

  // Keep modal openers, ProfileMenu will use context actions
  const handleOpenLoginModal = () => {
    openLoginModal();
    if (open) setOpen(false); // Close drawer if open
  };

  const handleOpenSignUpModal = () => {
    openSignUpModal();
    if (open) setOpen(false); // Close drawer if open
  };

  return (
    <div>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: 'transparent',
          backgroundImage: 'none',
          mt: 2,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            variant="regular"
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              borderRadius: '9px',
              bgcolor:
                theme.palette.mode === 'light'
                  ? 'rgba(255, 255, 255, 0.4)'
                  : 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(24px)',
              maxHeight: 40,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow:
                theme.palette.mode === 'light'
                  ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                  : '0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)',
              pl: 3,
            })}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                ml: '-18px',
                px: 0,
              }}
            >
              <img
                src={logo}
                style={logoStyle}
                alt="logo of theJunkyard"
                onClick={() => window.open("/", "_self")}
              />
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <MenuItem onClick={() => window.open("/", "_self")} sx={{ py: '6px', px: '12px' }}>
                  <Typography variant="body2" color="text.primary">
                    Home
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => window.open("/calcbasic-web", "_self")} sx={{ py: '6px', px: '12px' }}>
                  <Typography variant="body2" color="text.primary">
                    calcBasic
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => window.open("/ytthumb", "_self")} sx={{ py: '6px', px: '12px' }}>
                  <Typography variant="body2" color="text.primary">
                    YTThumb
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => window.open("/manualbudget", "_self")} sx={{ py: '6px', px: '12px' }}>
                  <Typography variant="body2" color="text.primary">
                    Manual Budget
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => window.open("/expensereport", "_self")} sx={{ py: '6px', px: '12px' }}> {/* Add Expense Report Link */}
                  <Typography variant="body2" color="text.primary">
                    Expense Report
                  </Typography>
                </MenuItem>
              </Box>
            </Box>
            {/* Desktop: Show auth buttons or ProfileMenu based on context */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {(!loading && !activeUser) ? ( // Check activeUser from context
                <>
                  <MenuItem onClick={handleOpenSignUpModal} sx={{ py: '6px', px: '12px' }}>
                    <HowToRegIcon sx={{ mr: 0.5, color: 'text.primary' }} />
                    <Typography variant="body2" color="text.primary">Sign Up</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleOpenLoginModal} sx={{ py: '6px', px: '12px' }}>
                    <LoginIcon sx={{ mr: 0.5, color: 'text.primary' }} />
                    <Typography variant="body2" color="text.primary">Log In</Typography>
                  </MenuItem>
                </>
              ) : !loading ? ( // Render ProfileMenu if not loading and user exists
                <ProfileMenu
                  // Pass modal openers for the "Add Account" functionality
                  openLoginModal={handleOpenLoginModal}
                  openSignUpModal={handleOpenSignUpModal}
                  // No need to pass user or signOut, ProfileMenu uses context
                  sx={{ p: 0 }}
                />
              ) : null /* Optionally show a loader */}
              <ToggleColorMode mode={mode} toggleColorMode={handleThemeChange} />
            </Box>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              {/* Mobile: ProfileMenu placed left of hamburger */}
              {!loading && activeUser && ( // Only show ProfileMenu if logged in
                 <ProfileMenu
                    openLoginModal={handleOpenLoginModal}
                    openSignUpModal={handleOpenSignUpModal}
                    sx={{ p: 0}}
                 />
              )}
              <Button
                variant="text"
                color="primary"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ minWidth: '30px', p: '4px' }}
              >
                <MenuIcon />
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {/* Mobile Drawer */}
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            minWidth: '60dvw',
            p: 2,
            backgroundColor: 'background.paper',
            flexGrow: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'end',
              flexGrow: 1,
            }}
          >
            <ToggleColorMode mode={mode} toggleColorMode={handleThemeChange} />
          </Box>
          {/* Navigation MenuItems remain the same */}
          <MenuItem onClick={() => window.open("/", "_self")}>
            Home
          </MenuItem>
          <MenuItem onClick={() => window.open("/calcbasic-web", "_self")}>
            calcBasic
          </MenuItem>
          <MenuItem onClick={() => window.open("/ytthumb", "_self")}>
            YTThumb
          </MenuItem>
          <MenuItem onClick={() => window.open("/manualbudget", "_self")}>
            Manual Budget
          </MenuItem>
          <MenuItem onClick={() => window.open("/expensereport", "_self")}> {/* Add Expense Report Link */}
            Expense Report
          </MenuItem>
          <Divider />
          {/* Mobile Auth Options - Render based on context */}
          {(!loading && !activeUser) ? (
            <>
              <MenuItem onClick={() => { handleOpenSignUpModal(); toggleDrawer(false)(); }}>
                 <HowToRegIcon sx={{ mr: 1 }} /> Sign Up
              </MenuItem>
              <MenuItem onClick={() => { handleOpenLoginModal(); toggleDrawer(false)(); }}>
                 <LoginIcon sx={{ mr: 1 }} /> Log In
              </MenuItem>
            </>
          ) : (
            // Optionally add mobile-specific account management items here if needed,
            // or rely on the ProfileMenu component being accessible.
            // For simplicity, we assume ProfileMenu handles mobile needs too.
            // If not, add items like "Switch Account", "Sign Out", etc. here, using context functions.
            null
          )}
        </Box>
      </Drawer>

      {/* Modals remain the same, but their internal logic will change */}
      <LoginModal
        open={loginModalOpen}
        onClose={closeLoginModal}
        // Pass app if needed by modal internals, or let modal use context
      />
      <SignUpModal
        open={signUpModalOpen}
        onClose={closeSignUpModal}
        // Pass app if needed by modal internals, or let modal use context
      />
    </div>
  );
}

AppAppBar.propTypes = {
  mode: PropTypes.oneOf(['dark', 'light']).isRequired,
  toggleColorMode: PropTypes.func.isRequired,
  // app: PropTypes.object.isRequired, // app might become optional if context provides it
};

export default AppAppBar;
