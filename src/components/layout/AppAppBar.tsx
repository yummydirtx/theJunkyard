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

import PropTypes from 'prop-types';
import { useState } from 'react';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LoginIcon from '@mui/icons-material/Login';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import logo from '../../assets/websitelogo.png';
import { useAuth } from '../../contexts/AuthContext';
import useModal from '../../hooks/useModal';
import LoginModal from '../../features/authentication/components/LoginModal';
import SignUpModal from '../../features/authentication/components/SignUpModal';
import ProfileMenu from '../ui/ProfileMenu';
import ToggleColorMode from '../ui/ToggleColorMode';
import DesktopNavigation from './navigation/DesktopNavigation';
import MobileNavigation from './navigation/MobileNavigation';
import { useThemeHandler } from './hooks/useThemeHandler';

const logoStyle = {
  width: '150px',
  height: 'auto',
  cursor: 'pointer',
};

interface AppAppBarProps {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
}

/**
 * AppAppBar component renders the main application navigation bar.
 * It includes navigation links, theme toggling, and authentication actions (login/signup/profile).
 * It adapts its layout for desktop and mobile views.
 * @param {object} props - The component's props.
 * @param {('light' | 'dark')} props.mode - The current color mode.
 * @param {function} props.toggleColorMode - Function to toggle the color mode.
 */
function AppAppBar({ mode, toggleColorMode }: AppAppBarProps) {
  /** @state {boolean} open - Controls the visibility of the mobile navigation drawer. */
  const [open, setOpen] = useState(false);
  const { activeUser, loading, db, app } = useAuth() as {
    activeUser: any;
    loading: boolean;
    db: any;
    app: any;
  };

  /** @state {boolean} loginModalOpen - Controls visibility of the login modal. */
  /** @function openLoginModal - Opens the login modal. */
  /** @function closeLoginModal - Closes the login modal. */
  const [loginModalOpen, openLoginModal, closeLoginModal] = useModal(false);
  /** @state {boolean} signUpModalOpen - Controls visibility of the sign-up modal. */
  /** @function openSignUpModal - Opens the sign-up modal. */
  /** @function closeSignUpModal - Closes the sign-up modal. */
  const [signUpModalOpen, openSignUpModal, closeSignUpModal] = useModal(false);

  const { handleThemeChange } = useThemeHandler({ mode, toggleColorMode, activeUser, db });

  /**
   * Toggles the mobile navigation drawer.
   * @param {boolean} newOpen - The desired state of the drawer (true for open, false for closed).
   * @returns {function} Event handler function.
   */
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
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
            })}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                px: 0,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  ml: -2,
                  mr: 1,
                }}
              >
                <img
                  src={logo}
                  style={logoStyle}
                  alt="logo of theJunkyard"
                  onClick={() => window.open("/", "_self")}
                />
              </Box>
              <DesktopNavigation />
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
                <ProfileMenu sx={{ p: 0 }} />
              ) : null}
              <ToggleColorMode mode={mode} toggleColorMode={handleThemeChange} />
            </Box>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              {!loading && activeUser && (
                <ProfileMenu sx={{ p: 0 }} />
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

      <MobileNavigation
        open={open}
        onClose={toggleDrawer(false)}
        mode={mode}
        toggleColorMode={handleThemeChange}
        activeUser={activeUser}
        loading={loading}
        onOpenLoginModal={handleOpenLoginModal}
        onOpenSignUpModal={handleOpenSignUpModal}
      />

      <LoginModal
        open={loginModalOpen}
        onClose={closeLoginModal}
        app={app}
      />
      <SignUpModal
        open={signUpModalOpen}
        onClose={closeSignUpModal}
        app={app}
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
