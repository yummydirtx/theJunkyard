import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
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
import logo from '../assets/websitelogo.png';

const logoStyle = {
  width: '150px',
  height: 'auto',
  cursor: 'pointer',
};

function AppAppBar({ mode, toggleColorMode, app }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null); // Track the signed-in user
  const auth = getAuth(app);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update the user state
    });
    return unsubscribe; // Cleanup the listener on unmount
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
              </Box>
            </Box>
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              {user ? (
                <MenuItem onClick={handleSignOut} sx={{ py: '6px', px: '12px' }}>
                  <Typography variant="body2" color="text.primary">
                    Sign Out
                  </Typography>
                </MenuItem>
              ) : (
                <>
                  <MenuItem onClick={() => window.open("/signup", "_self")} sx={{ py: '6px', px: '12px' }}>
                    <Typography variant="body2" color="text.primary">
                      Sign Up
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={() => window.open("/login", "_self")} sx={{ py: '6px', px: '12px' }}>
                    <Typography variant="body2" color="text.primary">
                      Log In
                    </Typography>
                  </MenuItem>
                </>
              )}
              <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
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
                    <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
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
                  <Divider />
                  {user ? (
                    <MenuItem onClick={handleSignOut}>
                      Sign Out
                    </MenuItem>
                  ) : (
                    <>
                      <MenuItem onClick={() => window.open("/signup", "_self")}>
                        Sign Up
                      </MenuItem>
                      <MenuItem onClick={() => window.open("/login", "_self")}>
                        Log In
                      </MenuItem>
                    </>
                  )}
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
}

AppAppBar.propTypes = {
  mode: PropTypes.oneOf(['dark', 'light']).isRequired,
  toggleColorMode: PropTypes.func.isRequired,
};

export default AppAppBar;
