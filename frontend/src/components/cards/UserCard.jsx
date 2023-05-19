import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import * as React from 'react';

// Adapted from https://mui.com/material-ui/react-card/
export default function UserCard({
  username, firstName, lastName, userId, link,
}) {
  return (
    <Card sx={{ width: '100%' }}>
      <CardActionArea href={encodeURI(link)} sx={{ display: 'flex', width: '100%', justifyContent: 'start' }}>
        <AccountCircleOutlinedIcon sx={{ height: '100%', width: '3rem', margin: '0 1rem' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography component="div" variant="h5">
              {`${firstName || ''} ${lastName || ''}`}
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              {`@${username || userId}`}
            </Typography>
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}
