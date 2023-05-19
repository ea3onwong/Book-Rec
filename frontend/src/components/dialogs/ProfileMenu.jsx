import AccountCircle from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { React, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import SettingsForm from '../forms/SettingsForm';
import LogoutDialogMenuItem from './LogoutMenuItem';

// Adapted from https://mui.com/material-ui/react-app-bar/#app-bar-with-a-primary-search-field
function ProfileMenu() {
  const [anchorElUser, setAnchorElUser] = useState(null);

  const jwt = useLoaderData();
  // eslint-disable-next-line no-underscore-dangle
  const userId = jwt?._id ? jwt._id : '';

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  /**
   * Why is all of this settings dialog stuff here, but not in the logout dialog?
   * MUI has a bug where Tab key gets hogged if it is inside a Menu
   * https://github.com/mui/material-ui/issues/20173
   */
  const [openSettings, setOpenSettings] = useState(false);

  const handleCloseSettings = () => {
    setOpenSettings(false);
  };

  const handleToggleSettings = () => {
    handleCloseUserMenu();
    setOpenSettings(!openSettings);
  };

  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Open settings">
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, margin: '0 32px 0 32px' }}>
          <AccountCircle sx={{ width: '32px', height: '32px', color: '#fff' }} />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem component={Link} href={encodeURI(`/profile/${userId}`)}>Profile</MenuItem>
        <MenuItem component={Link} onClick={handleToggleSettings}>Settings</MenuItem>
        <LogoutDialogMenuItem onClick={handleCloseUserMenu} />
      </Menu>
      <Dialog onClose={handleCloseSettings} open={openSettings} fullWidth maxWidth="sm" PaperProps={{ sx: { maxHeight: '100%' } }}>
        <DialogTitle align="center" sx={{ marginTop: '2%' }}>Settings</DialogTitle>
        <SettingsForm />
      </Dialog>
    </Box>
  );
}

export default ProfileMenu;
