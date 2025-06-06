import { useState, useEffect } from 'react';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LoginIcon from '@mui/icons-material/Login';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import MenuItem from '@mui/material/MenuItem';
import { SvgIcon } from '@mui/material';
import { mainNavigationItems, moreNavigationItems, NavigationItem } from './navigationConfig';
import ToggleColorMode from '../../ui/ToggleColorMode';

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
  activeUser: any;
  loading: boolean;
  onOpenLoginModal: () => void;
  onOpenSignUpModal: () => void;
}

const MobileNavigationItem = ({ item, onClose }: { item: NavigationItem; onClose?: () => void }) => {
  const IconComponent = item.icon as typeof SvgIcon;
  
  return (
    <MenuItem onClick={() => {
      onClose?.();
      window.open(item.href, item.external ? "_blank" : "_self");
    }}>
      {item.label} {IconComponent && <IconComponent sx={{ fontSize: 'inherit', verticalAlign: 'middle', ml: 0.5 }} />}
    </MenuItem>
  );
};

export default function MobileNavigation({
  open,
  onClose,
  mode,
  toggleColorMode,
  activeUser,
  loading,
  onOpenLoginModal,
  onOpenSignUpModal
}: MobileNavigationProps) {
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  // Reset the More section state when the drawer closes
  useEffect(() => {
    if (!open) {
      setMobileMoreOpen(false);
    }
  }, [open]);

  const handleMobileMoreToggle = () => {
    setMobileMoreOpen(!mobileMoreOpen);
  };

  const handleClose = () => {
    onClose();
    setMobileMoreOpen(false);
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleClose}>
      <Box
        sx={{
          minWidth: '60dvw',
          p: 2,
          backgroundColor: 'background.paper',
          flexGrow: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', flexGrow: 1 }}>
          <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
        </Box>
        
        {mainNavigationItems.map((item) => (
          <MobileNavigationItem key={item.label} item={item} onClose={handleClose} />
        ))}
        
        <MenuItem onClick={handleMobileMoreToggle}>
          More <KeyboardArrowDownIcon sx={{ 
            transform: mobileMoreOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s' 
          }} />
        </MenuItem>
        
        <Collapse in={mobileMoreOpen} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 2 }}>
            {moreNavigationItems.map((item) => (
              <MobileNavigationItem key={item.label} item={item} onClose={handleClose} />
            ))}
          </Box>
        </Collapse>
        
        <Divider />
        
        {(!loading && !activeUser) && (
          <>
            <MenuItem onClick={() => { onOpenSignUpModal(); handleClose(); }}>
              <HowToRegIcon sx={{ mr: 1 }} /> Sign Up
            </MenuItem>
            <MenuItem onClick={() => { onOpenLoginModal(); handleClose(); }}>
              <LoginIcon sx={{ mr: 1 }} /> Log In
            </MenuItem>
          </>
        )}
      </Box>
    </Drawer>
  );
}
