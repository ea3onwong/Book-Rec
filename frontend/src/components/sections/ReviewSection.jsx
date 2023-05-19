import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Rating from '@mui/material/Rating';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { React, useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import ReviewCard from '../cards/ReviewCard';

function ReviewSection({
  numReaders, reviewData,
}) {
  const [sortBy, setSortBy] = useState('recent');
  const [displayData, setDisplayData] = useState([]);
  const [filterRating, setFilterRating] = useState(0);
  const handleSortChange = (event) => setSortBy(event.target.value);

  const jwt = useLoaderData();
  // eslint-disable-next-line no-underscore-dangle
  const userId = jwt?._id ? jwt._id : '';
  const isModerator = jwt?.moderator ? jwt.moderator : false;

  useEffect(() => {
    const compareRecent = (a, b) => new Date(b.review_date) - new Date(a.review_date);
    const compareOld = (a, b) => new Date(a.review_date) - new Date(b.review_date);
    const compare = sortBy === 'recent' ? compareRecent : compareOld;
    const newDisplayData = [...reviewData]
      .sort(compare)
      .filter((review) => filterRating === 0 || review.rating === filterRating);

    setDisplayData(newDisplayData);
  }, [reviewData, filterRating, sortBy]);

  const numReviews = reviewData.filter((review) => !!review?.review_text?.trim()).length;

  const ownReview = reviewData.find((review) => review.user_id === userId);

  const ratingCard = ownReview && (
    <ReviewCard
      // eslint-disable-next-line no-underscore-dangle
      reviewId={ownReview._id}
      userId={ownReview.user_id}
      username={ownReview.username}
      rating={ownReview.rating}
      reviewText={ownReview.review_text}
      reviewDate={ownReview.review_date}
      ratingIncluded={ownReview.rating_included}
      isOwnReview={userId === ownReview.user_id}
      isModerator={isModerator}
    />
  );

  const reviewCards = displayData
    .filter((review) => !!review?.review_text?.trim())
    .map((review) => (
      <ReviewCard
        // eslint-disable-next-line no-underscore-dangle
        key={review._id}
        // eslint-disable-next-line no-underscore-dangle
        reviewId={review._id}
        userId={review.user_id}
        username={review.username}
        rating={review.rating}
        reviewText={review.review_text}
        reviewDate={review.review_date}
        ratingIncluded={review.rating_included}
        isOwnReview={userId === review.user_id}
        isModerator={isModerator}
      />
    ));

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', gap: '1rem 0', width: '100%',
    }}
    >
      {ratingCard && (
        <>
          <Typography variant="h4">Your Review</Typography>
          <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
          {ratingCard}
          <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
        </>
      )}
      <Box sx={{
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '0 1rem', width: '100%',
      }}
      >
        <Box sx={{
          display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0 1rem',
        }}
        >
          <Typography variant="h4">Reviews</Typography>
          <Typography variant="subtitle1">{`${numReviews.toLocaleString()} reviews • Read by ${numReaders} people`}</Typography>
        </Box>
        <Box sx={{
          display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0 2rem',
        }}
        >
          <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0 1rem',
          }}
          >
            <Typography variant="subtitle1">Filter by</Typography>
            <Rating name="read-only" value={filterRating} precision={1} onChange={(event) => setFilterRating(Number(event.target.value))} />
          </Box>
          <Button variant="text" type="button" onClick={() => setFilterRating(0)}>Clear</Button>
          <FormControl>
            <InputLabel id="sort-by-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-select-label"
              id="sort-by-select"
              value={sortBy}
              label="Sort Reviews By"
              onChange={handleSortChange}
            >
              <MenuItem value="recent">Recently Added</MenuItem>
              <MenuItem value="old">Oldest Added</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
      {reviewCards.length > 0 && reviewCards}
      {reviewCards.length === 0 && <Typography variant="body1">No reviews yet.</Typography>}
    </Box>
  );
}

export default ReviewSection;
