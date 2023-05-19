import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { React } from 'react';
import BookPageDetailsNYT from './BookPageDetailsNYT';

function BookPageDetails({
  publisher, publicationDate, categories, rankingData, isbn,
}) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'space-between', width: '100%', gap: '0 1rem',
    }}
    >
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'start',
      }}
      >
        {categories && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0 1rem' }}>
            <Typography variant="h6">Genres</Typography>
            <Typography variant="body1">{` ${categories}`}</Typography>
          </Box>
        )}
        {publisher && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0 1rem' }}>
            <Typography variant="h6">Published by</Typography>
            <Typography variant="body1">{` ${publisher}`}</Typography>
          </Box>
        )}
        {publicationDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0 1rem' }}>
            <Typography variant="h6">Published on</Typography>
            <Typography variant="body1">{` ${new Date(publicationDate)?.toDateString() || publicationDate}`}</Typography>
          </Box>
        )}
        {isbn && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0 1rem' }}>
            <Typography variant="h6">ISBN</Typography>
            <Typography variant="body1">{isbn}</Typography>
          </Box>
        )}
      </Box>
      {rankingData && <BookPageDetailsNYT rankingData={rankingData} />}
    </Box>
  );
}

export default BookPageDetails;
