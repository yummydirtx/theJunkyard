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

import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
// Firebase services are used for saving user theme preferences.
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
import ProfileMenu from './ProfileMenu';
import { useAuth } from '../contexts/AuthContext';
import Menu from '@mui/material/Menu';
import Collapse from '@mui/material/Collapse';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LaunchIcon from '@mui/icons-material/Launch';

const logoStyle = {
  width: '150px',
  height: 'auto',
  cursor: 'pointer',
};

/**
 * AppAppBar component renders the main application navigation bar.
 * It includes navigation links, theme toggling, and authentication actions (login/signup/profile).
 * It adapts its layout for desktop and mobile views.
 * @param {object} props - The component's props.
 * @param {('light' | 'dark')} props.mode - The current color mode.
 * @param {function} props.toggleColorMode - Function to toggle the color mode.
 */
function AppAppBar({ mode, toggleColorMode }) {
  /** @state {boolean} open - Controls the visibility of the mobile navigation drawer. */
  const [open, setOpen] = useState(false);
  const { activeUser, loading, db } = useAuth();

  /** @state {boolean} loginModalOpen - Controls visibility of the login modal. */
  /** @function openLoginModal - Opens the login modal. */
  /** @function closeLoginModal - Closes the login modal. */
  const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
  /** @state {boolean} signUpModalOpen - Controls visibility of the sign-up modal. */
  /** @function openSignUpModal - Opens the sign-up modal. */
  /** @function closeSignUpModal - Closes the sign-up modal. */
  const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);

  // State for Desktop "More" Menu
  /** @state {HTMLElement|null} anchorEl - The anchor element for the desktop "More" menu. */
  const [anchorEl, setAnchorEl] = useState(null);
  const openMoreMenu = Boolean(anchorEl);
  /** Handles clicking the "More" button to open the dropdown menu. */
  const handleMoreMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  /** Closes the "More" dropdown menu. */
  const handleMoreMenuClose = () => {
    setAnchorEl(null);
  };

  // State for Mobile "More" Collapse
  /** @state {boolean} mobileMoreOpen - Controls the visibility of the collapsible "More" section in the mobile drawer. */
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  /** Toggles the collapsible "More" section in the mobile drawer. */
  const handleMobileMoreToggle = () => {
    setMobileMoreOpen(!mobileMoreOpen);
  };

  /**
   * Toggles the mobile navigation drawer.
   * @param {boolean} newOpen - The desired state of the drawer (true for open, false for closed).
   * @returns {function} Event handler function.
   */
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
    if (!newOpen) {
        setMobileMoreOpen(false); // Ensure mobile "More" section is closed when drawer closes.
    }
  };

  /**
   * Handles theme change: toggles the color mode and saves the preference to Firestore if a user is logged in.
   * @async
   */
  const handleThemeChange = async () => {
    toggleColorMode();
    if (activeUser) {
      try {
        const newMode = mode === 'light' ? 'dark' : 'light';
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

  /** Opens the login modal and closes the mobile drawer if it's open. */
  const handleOpenLoginModal = () => {
    openLoginModal();
    if (open) setOpen(false); // Close drawer if open
  };

  /** Opens the sign-up modal and closes the mobile drawer if it's open. */
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
                <MenuItem onClick={() => window.open("/manualbudget", "_self")} sx={{ py: '6px', px: '12px' }}>
                  <Typography variant="body2" color="text.primary">
                    Manual Budget
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => window.open("/expensereport", "_self")} sx={{ py: '6px', px: '12px' }}>
                  <Typography variant="body2" color="text.primary">
                    Expense Report (beta)
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => window.open("https://anteaterfind.com", "_blank")} sx={{ py: '6px', px: '12px' }}>
                  <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    AnteaterFind <LaunchIcon sx={{ ml: 0.5, fontSize: 'inherit' }} />
                  </Typography>
                </MenuItem>
                {/* Desktop "More" dropdown button */}
                <Button
                  id="more-button"
                  aria-controls={openMoreMenu ? 'more-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={openMoreMenu ? 'true' : undefined}
                  onClick={handleMoreMenuClick}
                  sx={{ py: '6px', px: '12px', textTransform: 'none' }}
                  endIcon={<KeyboardArrowDownIcon />}
                >
                   <Typography variant="body2" color="text.primary">
                    More
                  </Typography>
                </Button>
                {/* Desktop "More" dropdown menu */}
                <Menu
                  id="more-menu"
                  anchorEl={anchorEl}
                  open={openMoreMenu}
                  onClose={handleMoreMenuClose}
                  slotProps={{
                    paper: {
                      sx: {
                        // Add any specific paper styles here if needed
                      },
                    },
                    list: {
                      'aria-labelledby': 'more-button',
                    }
                  }}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={() => { handleMoreMenuClose(); window.open("/calcbasic-web", "_self"); }} sx={{ py: '6px', px: '12px' }}>
                    <Typography variant="body2" color="text.primary">
                      calcBasic
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={() => { handleMoreMenuClose(); window.open("/ytthumb", "_self"); }} sx={{ py: '6px', px: '12px' }}>
                    <Typography variant="body2" color="text.primary">
                      YTThumb
                    </Typography>
                  </MenuItem>
                  {/* Example of an external link within the "More" menu, currently commented out.
                  <MenuItem onClick={() => { handleMoreMenuClose(); window.open("https://anteaterfind.com", "_blank"); }} sx={{ py: '6px', px: '12px' }}>
                    <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                      AnteaterFind <LaunchIcon sx={{ ml: 0.5, fontSize: 'inherit' }} />
                    </Typography>
                  </MenuItem> */}
                </Menu>
              </Box>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {(!loading && !activeUser) ? (
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
              ) : !loading ? (
                <ProfileMenu
                  openLoginModal={handleOpenLoginModal}
                  openSignUpModal={handleOpenSignUpModal}
                  sx={{ p: 0 }}
                />
              ) : null}
              <ToggleColorMode mode={mode} toggleColorMode={handleThemeChange} />
            </Box>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              {!loading && activeUser && (
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
          <MenuItem onClick={() => window.open("/", "_self")}>
            Home
          </MenuItem>
          <MenuItem onClick={() => window.open("/manualbudget", "_self")}>
            Manual Budget
          </MenuItem>
          <MenuItem onClick={() => window.open("/expensereport", "_self")}>
            Expense Report (beta)
          </MenuItem>
          <MenuItem onClick={() => window.open("https://anteaterfind.com", "_blank")}>
            AnteaterFind <LaunchIcon sx={{ fontSize: 'inherit', verticalAlign: 'middle', ml: 0.5 }} />
          </MenuItem>
          {/* Mobile "More" collapsible section trigger */}
          <MenuItem onClick={handleMobileMoreToggle}>
            More <KeyboardArrowDownIcon sx={{ transform: mobileMoreOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </MenuItem>
          {/* Mobile "More" collapsible content */}
          <Collapse in={mobileMoreOpen} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 2 }}>
              <MenuItem onClick={() => { toggleDrawer(false)(); window.open("/calcbasic-web", "_self"); }}>
                calcBasic
              </MenuItem>
              <MenuItem onClick={() => { toggleDrawer(false)(); window.open("/ytthumb", "_self"); }}>
                YTThumb
              </MenuItem>
              {/* Example of an external link within the mobile "More" section, currently commented out.
              <MenuItem onClick={() => { toggleDrawer(false)(); window.open("https://anteaterfind.com", "_blank"); }}>
                AnteaterFind <LaunchIcon sx={{ fontSize: 'inherit', verticalAlign: 'middle', ml: 0.5 }} />
              </MenuItem> */}
            </Box>
          </Collapse>
          <Divider />
          {(!loading && !activeUser) ? (
            <>
              <MenuItem onClick={() => { handleOpenSignUpModal(); toggleDrawer(false)(); }}>
                 <HowToRegIcon sx={{ mr: 1 }} /> Sign Up
              </MenuItem>
              <MenuItem onClick={() => { handleOpenLoginModal(); toggleDrawer(false)(); }}>
                 <LoginIcon sx={{ mr: 1 }} /> Log In
              </MenuItem>
            </>
          ) : null}
        </Box>
      </Drawer>
      <LoginModal
        open={loginModalOpen}
        onClose={closeLoginModal}
      />
      <SignUpModal
        open={signUpModalOpen}
        onClose={closeSignUpModal}
      />
    </div>
  );
}

AppAppBar.propTypes = {
  /** Current color mode ('light' or 'dark'). */
  mode: PropTypes.oneOf(['dark', 'light']).isRequired,
  /** Function to toggle the color mode. */
  toggleColorMode: PropTypes.func.isRequired,
  /** The initialized Firebase app instance. Passed to AuthProvider, not directly used here often. */
  app: PropTypes.object,
};

export default AppAppBar;
