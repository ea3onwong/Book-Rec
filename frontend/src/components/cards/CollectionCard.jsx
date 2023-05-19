import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import * as React from 'react';

// Adapted from https://mui.com/material-ui/react-card/
export default function CollectionCard({
  image, alt, title, bookCount, description, link, sx,
}) {
  return (
    <Card sx={{ minHeight: '256px', ...sx }}>
      <CardActionArea
        href={encodeURI(link)}
        sx={{
          display: 'flex', width: '100%', justifyContent: 'start', minHeight: '256px',
        }}
      >
        {image
          ? (
            <CardMedia
              component="img"
              sx={{ width: 151 }}
              image={image}
              alt={alt}
            />
          ) : (
            <LibraryBooksOutlinedIcon sx={{ width: 151, height: '50%', verticalAlign: 'middle' }} />
          )}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography component="div" variant="h5">
              {title}
            </Typography>
            { bookCount >= 0 && (
              <Typography variant="subtitle2" color="text.secondary" component="div">
                {`${bookCount} book${bookCount === 1 ? '' : 's'}`}
              </Typography>
            )}
            <Typography variant="subtitle1" color="text.secondary" component="div">
              {description || ''}
            </Typography>
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}
