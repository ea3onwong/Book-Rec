import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutDialogMenuItem({ onClick }) {
  const navigate = useNavigate();

  const logout = () => {
    onClick();
    navigate('/logout');
  };

  return (
    <MenuItem component={Link} onClick={logout}>Logout</MenuItem>
  );
}

export default LogoutDialogMenuItem;
