import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { React, useState } from 'react';

function TermsAndConditionsDialogButton() {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm" PaperProps={{ sx: { maxHeight: '100%' } }}>
        <DialogTitle align="center" sx={{ marginTop: '2%' }}>HOLY SHIT YOU ARE THE FIRST PERSON TO EVER CLICK THIS WTF ARE YOU DOING WITH YOUR LIFE BROTHER</DialogTitle>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </Dialog>
      <Typography>
        {'I agree to the '}
        { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
        <Link component="button" variant="body1" type="button" onClick={handleToggle}>
          terms and conditions
        </Link>
      </Typography>
    </>
  );
}

export default TermsAndConditionsDialogButton;
