import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import {
  React, useEffect, useRef, useState,
} from 'react';
import AddToCollectionsDialogButton from '../dialogs/AddToCollectionsDialogButton';
import ReadForFreeDialogButton from '../dialogs/ReadForFreeDialogButton';
import RecordBookDialogButton from '../dialogs/RecordBookDialogButton';

function BookPageHeader({
  img, title, author, avgRating, numRatings, description,
  bookId, collectionNames, isFree, hasReview,
}) {
  const [descriptionTruncated, setDescriptionTruncated] = useState(true);
  const descRef = useRef();
  const [isTruncatable, setIsTruncatable] = useState(false);

  useEffect(() => {
    if (descRef.current && descRef.current?.clientHeight && descRef.current?.scrollHeight) {
      const { clientHeight, scrollHeight } = descRef.current;
      setIsTruncatable(isTruncatable || scrollHeight > clientHeight);
    }
  }, [descRef.current, descRef.current?.clientHeight, descRef.current?.scrollHeight]);

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'space-between', width: '100%', gap: '0 1rem',
    }}
    >
      <img src={img} alt="Book cover" style={{ width: '20%', height: 'auto' }} />
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'start', flexGrow: 1,
      }}
      >
        <Typography variant="h4">{title}</Typography>
        <Typography variant="subtitle1">{`By ${author}`}</Typography>
        <Typography
          variant="body1"
          marginTop="2rem"
          sx={{
            // src: https://stackoverflow.com/questions/63592567/material-ui-text-ellipsis-after-two-line
            overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: descriptionTruncated ? '3' : 'none',
          }}
          ref={descRef}
        >
          {description}
        </Typography>
        {isTruncatable && (
          <Button variant="text" sx={{ width: 'fit-content', margin: '0 auto' }} onClick={() => setDescriptionTruncated(!descriptionTruncated)}>
            { descriptionTruncated ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon /> }
          </Button>
        )}
      </Box>
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', gap: '1rem 0',
      }}
      >
        <Box sx={{
          display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '0 2rem',
        }}
        >
          <Box sx={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          }}
          >
            <Typography variant="subtitle1" sx={{ whiteSpace: 'nowrap' }}>People rated this</Typography>
            <Rating name="read-only" value={avgRating} precision={0.5} readOnly />
          </Box>
          <Box sx={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          }}
          >
            <Typography variant="h5">{ avgRating.toFixed(1) }</Typography>
            <Typography variant="subtitle1" sx={{ whiteSpace: 'nowrap' }}>{ `${numRatings} rating${numRatings === 1 ? '' : 's'}` }</Typography>
          </Box>
        </Box>
        { !hasReview && (<RecordBookDialogButton bookId={bookId} />) }
        <AddToCollectionsDialogButton bookId={bookId} collectionNames={collectionNames} />
        { isFree && <ReadForFreeDialogButton bookId={bookId} /> }
      </Box>
    </Box>
  );
}

export default BookPageHeader;
