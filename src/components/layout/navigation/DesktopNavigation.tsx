import { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { SvgIcon } from '@mui/material';
import { mainNavigationItems, moreNavigationItems, NavigationItem } from './navigationConfig';

const NavigationMenuItem = ({ item }: { item: NavigationItem }) => {
  const IconComponent = item.icon as typeof SvgIcon;
  
  return (
    <MenuItem 
      onClick={() => window.open(item.href, item.external ? "_blank" : "_self")} 
      sx={{ py: '6px', px: '12px' }}
    >
      <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
        {item.label} {IconComponent && <IconComponent sx={{ ml: 0.5, fontSize: 'inherit' }} />}
      </Typography>
    </MenuItem>
  );
};

export default function DesktopNavigation() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const openMoreMenu = Boolean(anchorEl);

  const handleMoreMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
      {mainNavigationItems.map((item) => (
        <NavigationMenuItem key={item.label} item={item} />
      ))}
      
      <Button
        id="more-button"
        aria-controls={openMoreMenu ? 'more-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openMoreMenu ? 'true' : 'false'}
        onClick={handleMoreMenuClick}
        sx={{ py: '6px', px: '12px', textTransform: 'none' }}
        endIcon={<KeyboardArrowDownIcon />}
      >
        <Typography variant="body2" color="text.primary">
          More
        </Typography>
      </Button>
      
      <Menu
        id="more-menu"
        anchorEl={anchorEl}
        open={openMoreMenu}
        onClose={handleMoreMenuClose}
        slotProps={{
          paper: { sx: {} },
          list: { 'aria-labelledby': 'more-button' }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {moreNavigationItems.map((item) => (
          <MenuItem 
            key={item.label}
            onClick={() => { 
              handleMoreMenuClose(); 
              window.open(item.href, item.external ? "_blank" : "_self"); 
            }} 
            sx={{ py: '6px', px: '12px' }}
          >
            <Typography variant="body2" color="text.primary">
              {item.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
