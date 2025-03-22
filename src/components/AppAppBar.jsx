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

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
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
import ToggleColorMode from './ToggleColorMode';
import LoginModal from './LoginModal';
import SignUpModal from './SignUpModal';
import logo from '../assets/websitelogo.png';

const logoStyle = {
  width: '150px',
  height: 'auto',
  cursor: 'pointer',
};

function AppAppBar({ mode, toggleColorMode, app }) {
  const [open, setOpen] = useState(false);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Set loading to false once we have the initial auth state
    });
    return unsubscribe;
  }, [auth]);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        window.open("/", "_self"); // Redirect to home after sign-out
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  const handleThemeChange = async () => {
    toggleColorMode();
    if (user) {
      try {
        const newMode = mode === 'light' ? 'dark' : 'light';
        await setDoc(doc(db, 'userPreferences', user.uid), {
          theme: newMode
        }, { merge: true });
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    }
  };

  const openLoginModal = () => {
    setLoginModalOpen(true);
    if (open) setOpen(false); // Close drawer if open
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const openSignUpModal = () => {
    setSignUpModalOpen(true);
    if (open) setOpen(false); // Close drawer if open
  };

  const closeSignUpModal = () => {
    setSignUpModalOpen(false);
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
              </Box>
            </Box>
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              {!loading && ( // Only show auth UI after loading
                user ? (
                  <MenuItem onClick={handleSignOut} sx={{ py: '6px', px: '12px' }}>
                    <Typography variant="body2" color="text.primary">
                      Sign Out
                    </Typography>
                  </MenuItem>
                ) : (
                  <>
                    <MenuItem onClick={openSignUpModal} sx={{ py: '6px', px: '12px' }}>
                      <Typography variant="body2" color="text.primary">
                        Sign Up
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={openLoginModal} sx={{ py: '6px', px: '12px' }}>
                      <Typography variant="body2" color="text.primary">
                        Log In
                      </Typography>
                    </MenuItem>
                  </>
                )
              )}
              <ToggleColorMode mode={mode} toggleColorMode={handleThemeChange} />
            </Box>
            <Box sx={{ display: { sm: '', md: 'none' } }}>
              <Button
                variant="text"
                color="primary"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ minWidth: '30px', p: '4px' }}
              >
                <MenuIcon />
              </Button>
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
                  <MenuItem onClick={() => window.open("/calcbasic-web", "_self")}>
                    calcBasic
                  </MenuItem>
                  <MenuItem onClick={() => window.open("/ytthumb", "_self")}>
                    YTThumb
                  </MenuItem>
                  <MenuItem onClick={() => window.open("/manualbudget", "_self")}>
                    Manual Budget
                  </MenuItem>
                  <Divider />
                  {!loading && ( // Only show auth UI after loading
                    user ? (
                      <MenuItem onClick={handleSignOut}>
                        Sign Out
                      </MenuItem>
                    ) : (
                      <>
                        <MenuItem onClick={openSignUpModal}>
                          Sign Up
                        </MenuItem>
                        <MenuItem onClick={openLoginModal}>
                          Log In
                        </MenuItem>
                      </>
                    )
                  )}
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
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
  mode: PropTypes.oneOf(['dark', 'light']).isRequired,
  toggleColorMode: PropTypes.func.isRequired,
};

export default AppAppBar;
