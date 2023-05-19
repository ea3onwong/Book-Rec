import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import DeleteReviewDialogButton from '../dialogs/DeleteReviewDialogButton';
import EditReviewDialogButton from '../dialogs/EditReviewDialogButton';

// Adapted from https://mui.com/material-ui/react-card/
export default function ReviewCard({
  username,
  userId,
  reviewDate,
  rating,
  reviewText,
  ratingIncluded,
  isModerator,
  isOwnReview,
  reviewId,
}) {
  const formattedDate = new Date(reviewDate).toDateString();
  const reviewIncluded = !!reviewText;
  const reviewType = reviewIncluded ? 'Review' : 'Read';
  const reviewTypePastTense = reviewIncluded ? 'Reviewed' : 'Rated';

  return (
    <Card variant="outlined" sx={{ width: '100%', boxShadow: '0', borderWidth: '2px' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Box sx={{
            display: 'flex', flexDirection: 'row', gap: '0 1rem', alignItems: 'center',
          }}
          >
            <AccountCircleOutlinedIcon sx={{ width: '3rem', height: '3rem' }} />
            <Typography component="div" variant="body1">
              {`${reviewType} by `}
              <Link href={encodeURI(`/profile/${userId}`)}>{`@${username}`}</Link>
            </Typography>
            <Typography component="div" variant="subtitle1">•</Typography>
            <Typography component="div" variant="subtitle1">{`${reviewTypePastTense} on ${formattedDate}`}</Typography>
            {ratingIncluded && (
              <>
                <Typography component="div" variant="subtitle1">•</Typography>
                <Rating name="read-only" value={rating} precision={1} readOnly />
              </>
            )}
            {isOwnReview && (
              <EditReviewDialogButton
                reviewId={reviewId}
                reviewText={reviewText}
                rating={rating}
                sx={{ marginLeft: 'auto' }}
              />
            )}
            {(isOwnReview || isModerator) && (
              <DeleteReviewDialogButton
                reviewId={reviewId}
                reviewText={reviewText}
                rating={rating}
              />
            )}
          </Box>
          <Typography variant="body1" color="text.secondary" component="div" sx={{ margin: '2rem 0 0 3rem' }}>
            {reviewText}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
}
