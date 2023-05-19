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
  img, author, year, alt, title, rating, link, reviewDate, reviewText, ratingIncluded,
}) {
  // src https://stackoverflow.com/questions/5113374/javascript-check-if-variable-exists-is-defined-initialized
  const hasVar = (varName) => typeof varName !== 'undefined' && varName !== null;

  return (
    <Card sx={{ width: '100%', minHeight: '256px' }}>
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
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
              {ratingIncluded && hasVar(rating) && (
                <>
                  <Typography variant="h6" color="text.secondary" component="div">{rating}</Typography>
                  <Rating name="read-only" value={rating} precision={1} readOnly />
                </>
              )}
              <Typography variant="subtitle1" color="text.secondary" component="div">{` — Recorded on ${new Date(reviewDate).toDateString()}`}</Typography>
            </Box>
            { !!reviewText.trim() && (
              <Typography variant="body2" color="text.secondary" component="div">
                {reviewText}
              </Typography>
            )}
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}
