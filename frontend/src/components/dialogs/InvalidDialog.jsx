import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { React, useState } from 'react';

function InvalidDialog({ enabled }) {
  const [open, setOpen] = useState(enabled);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm" PaperProps={{ sx: { maxHeight: '100%' } }}>
      <DialogTitle align="center" sx={{ marginTop: '5%' }}>Reset Password</DialogTitle>
      <Typography align="center" variant="body1" sx={{ marginBottom: '5%' }}>Login details were invalid or have expired. Please login again!</Typography>
      <Button variant="contained" align="center" sx={{ width: '200px', margin: '0 auto 5% auto' }} onClick={handleClose}>Ok</Button>
    </Dialog>
  );
}

export default InvalidDialog;
