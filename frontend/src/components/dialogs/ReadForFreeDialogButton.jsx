import GoogleIcon from '@mui/icons-material/Google';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import {
  React,
  useEffect,
  useState,
} from 'react';

// based on https://chsohn15.medium.com/integrating-google-books-embedded-viewer-api-into-a-react-app-a81fde35c14d
function ReadForFreeDialogButton({ bookId }) {
  const [open, setOpen] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [viewerLoaded, setViewerLoaded] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (scriptLoaded || document.getElementById('google-books-script')) return;
    const script = document.createElement('script');
    script.src = 'https://www.google.com/books/jsapi.js';
    script.type = 'text/javascript';
    script.id = 'google-books-script';
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  let viewerInterval;

  useEffect(() => {
    const canvas = document.getElementById('viewerCanvas');
    if (scriptLoaded && !viewerLoaded) {
      window.google.books.load();
      setViewerLoaded(true);
      // window.google.books.setOnLoadCallback only really works in <head>
      // ... so screw it, setInterval
      // this is literally 100x more reliable than replying on google's api onload stuff
      viewerInterval = setInterval(() => {
        if (window.google.books.DefaultViewer) {
          const viewer = new window.google.books.DefaultViewer(canvas);
          window.viewer = viewer;
          viewer.load(bookId);
          clearInterval(viewerInterval);
        }
      }, 500);
    }
  }, [scriptLoaded]);

  return (
    <>
      <Dialog keepMounted onClose={handleClose} open={open} fullWidth maxWidth="sm" PaperProps={{ sx: { maxHeight: '100%', height: '90%' } }}>
        <div
          id="viewerCanvas"
          style={{ width: '100%', height: '100%' }}
        />
        {!scriptLoaded && (
          <Typography>Loading reader...</Typography>
        )}
      </Dialog>
      <Box sx={{
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', height: '100%',
      }}
      >
        <GoogleIcon sx={{ fontSize: '2rem' }} />
        <Typography>
          <Button variant="contained" sx={{ width: 'fit-content' }} onClick={handleToggle}>Read for Free</Button>
        </Typography>
      </Box>
    </>
  );
}

export default ReadForFreeDialogButton;
