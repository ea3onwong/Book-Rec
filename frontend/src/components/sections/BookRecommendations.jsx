import Box from '@mui/material/Box';
import { React } from 'react';
import FreeBookRecommendations from './FreeBookRecommendations';
import GeneralRecommendations from './GeneralRecommendations';
import NYTBookRecommendations from './NYTBookRecommendations';

function BookRecommendations() {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', margin: '5vh 10vw', gap: '1rem 0',
    }}
    >
      <GeneralRecommendations />
      <FreeBookRecommendations />
      <NYTBookRecommendations />
    </Box>
  );
}

export default BookRecommendations;
