import * as React from 'react';
import PropTypes from 'prop-types';

import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AppAppBar from './components/AppAppBar';
import Footer from './components/Footer';
import Me from './components/Me';

function useTitle(title) {
    React.useEffect(() => {
      const prevTitle = document.title
      document.title = title
      return () => {
        document.title = prevTitle
      }
    })
  }
  
  function ToggleCustomTheme({ showCustomTheme, toggleCustomTheme }) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100dvw',
          position: 'fixed',
          bottom: 24,
        }}
      >
        <ToggleButtonGroup
          color="primary"
          exclusive
          value={showCustomTheme}
          onChange={toggleCustomTheme}
          aria-label="Platform"
          sx={{
            backgroundColor: 'background.default',
            '& .Mui-selected': {
              pointerEvents: 'none',
            },
          }}
        >
          <ToggleButton value>
            <AutoAwesomeRoundedIcon sx={{ fontSize: '20px', mr: 1 }} />
            Custom theme
          </ToggleButton>
          <ToggleButton value={false}>Material Design 2</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    );
  }
  
  ToggleCustomTheme.propTypes = {
    showCustomTheme: PropTypes.shape({
      valueOf: PropTypes.func.isRequired,
    }).isRequired,
    toggleCustomTheme: PropTypes.func.isRequired,
  };
  
  export default function AboutMe() {
    useTitle('theJunkyard: About Me');
    const [mode, setMode] = React.useState('dark');
    const defaultTheme = createTheme({ palette: { mode } });
  
    const toggleColorMode = () => {
      setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };
  
    return (
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <AppAppBar mode={mode} toggleColorMode={toggleColorMode} />
        <Box sx={{ bgcolor: 'background.default' }}>
          <Me />
          <Divider />
          <Footer />
        </Box>
      </ThemeProvider>
    );
  }
  