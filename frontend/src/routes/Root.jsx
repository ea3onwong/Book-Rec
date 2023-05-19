import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Cookies from 'js-cookie';
import { React, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InvalidDialog from '../components/dialogs/InvalidDialog';
import ResetDialog from '../components/dialogs/ResetDialog';
import SignUpDialogButton from '../components/dialogs/SignUpDialogButton';
import SearchAppBar from '../components/sections/SearchAppBar';
import backgroundImage from '../images/bookshelf.jpg';

function LoginPage({ token, reset, invalid }) {
  return (
    <Box sx={{
      backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,1) 50%), url(${backgroundImage})`,
      width: '100vw',
      minHeight: '100vh',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
    >
      <header className="App-header">
        <SearchAppBar />
      </header>
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, gap: '2rem',
      }}
      >
        <Typography variant="h1">Track books you&apos;ve read.</Typography>
        <Typography variant="h1">Discover new books.</Typography>
        <Typography variant="h1">Review your novels.</Typography>
        <>
          { !token && <SignUpDialogButton /> }
          <ResetDialog enabled={!!reset} />
          <InvalidDialog enabled={!!invalid} />
        </>
      </Box>
    </Box>
  );
}

function Root({ reset, logout, invalid }) {
  const navigate = useNavigate();
  const token = Cookies.get('token');

  useEffect(() => {
    if (logout) {
      Cookies.remove('token');
      if (invalid) navigate('/invalid');
      else navigate('/');
    }
    if (token) {
      navigate('/home');
    }
  }, [logout, navigate]);

  return (
    <div className="App">
      <LoginPage token={token} reset={reset} invalid={invalid} />
    </div>
  );
}

export default Root;
