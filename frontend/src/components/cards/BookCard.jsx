import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import * as React from 'react';

// Adapted from https://mui.com/material-ui/react-card/
export default function BookCard({
  img, author, year, alt, title, reviewCount, avgRating, link, addedDate, adornment, numReaders,
}) {
  // src https://stackoverflow.com/questions/5113374/javascript-check-if-variable-exists-is-defined-initialized
  const hasVar = (varName) => typeof varName !== 'undefined' && varName !== null;
  return (
    <Card sx={{
      width: '100%', minHeight: '256px', display: 'flex', flexDirection: 'row',
    }}
    >
      <CardActionArea
        href={encodeURI(link)}
        sx={{
          display: 'flex', width: '100%', justifyContent: 'start', minHeight: '256px',
        }}
      >
        {img
          ? (
            <CardMedia
              component="img"
              sx={{ width: 151 }}
              image={img}
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
            <Typography variant="body1" color="text.secondary" component="div">
              {`By ${author}, ${year}`}
              {hasVar(addedDate) && (
                ` — Added on ${addedDate}`
              )}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
              {hasVar(avgRating) && (
                <>
                  <Typography variant="h6" color="text.secondary" component="div">{avgRating.toFixed(1)}</Typography>
                  <Rating name="read-only" value={avgRating} precision={0.5} readOnly />
                </>
              )}
              {hasVar(reviewCount) && (
                <Typography variant="subtitle1" color="text.secondary" component="div">
                  {`— ${reviewCount.toLocaleString()} review`}
                  {reviewCount === 1 ? '' : 's'}
                </Typography>
              )}
              {hasVar(numReaders) && (
                <Typography variant="subtitle1" color="text.secondary" component="div">
                  {`— ${numReaders.toLocaleString()} reader`}
                  {numReaders === 1 ? '' : 's'}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Box>
      </CardActionArea>
      {adornment}
    </Card>
  );
}
