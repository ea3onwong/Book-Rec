import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { React } from 'react';
import NYTIcon from '../NYTIcon';
import NYTHistoryDialogButton from '../dialogs/NYTHistoryDialogButton';

export default function BookPageDetailsNYT({ rankingData }) {
  if (!rankingData || !rankingData[0].rank) return null;
  const ranking = rankingData.reduce(
    (min, details) => Math.min(min, details.rank),
    rankingData[0].rank,
  );

  // branding guidelines followed per https://developer.nytimes.com/branding
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexGrow: 1, margin: 'auto 0',
    }}
    >
      <Link href="https://developer.nytimes.com/" color="inherit">
        <NYTIcon sx={{ fontSize: '3rem' }} />
      </Link>
      <Box sx={{
        borderRadius: '50%', border: '0.3rem solid black', height: '3rem', width: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center', userSelect: 'none',
      }}
      >
        <Typography variant="h4">{ranking}</Typography>
      </Box>
      <Box sx={{ padding: '0 2rem' }}>
        <NYTHistoryDialogButton rankingData={rankingData} />
      </Box>
    </Box>
  );
}
