import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { React, useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import SearchAppBar from '../components/sections/SearchAppBar';

export default function Error() {
  const error = useRouteError();

  useEffect(() => {
    document.title = 'Ruh Roh Raggy! - BookRec';
  }, []);

  return (
    <div id="error-page">
      <header>
        {
          /* can't use loaders in error,
          so jwt wont load and we cant access profile id to link to...
          so hide profile i guess */
        }
        <SearchAppBar hideProfile />
      </header>
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10vh 0', margin: '10vh 0', height: '100%',
      }}
      >
        <Typography variant="h1">Oops!</Typography>
        <Typography variant="h6">Sorry, an unexpected error has occurred.</Typography>
        <Typography variant="body1">
          <i>
            {error?.statusText || error?.message || 'The page you were looking for could not be found.'}
          </i>
        </Typography>
      </Box>
    </div>
  );
}
