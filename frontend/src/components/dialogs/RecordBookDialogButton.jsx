import { TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import FormHelperText from '@mui/material/FormHelperText';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Cookies from 'js-cookie';
import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchEndpoint from '../../fetchEndpoint';
import useEndpoint from '../../hooks/useEndpoint';
import Form from '../forms/Form';

function RecordBookForm({ bookId }) {
  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const emptyFields = !(rating || reviewText);
  const token = Cookies.get('token');
  // if leaving both a review and marking as read, need to wait for both to finish
  let waitingForBoth = false;

  const recordFetch = () => (
    fetchEndpoint(
      '/review/add',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            token,
            book_id: bookId,
            ...reviewText && { review_text: reviewText },
            ...(rating !== 0) && { rating },
          },
        ),
      },
    ));

  const [
    recordResponseCode, recordResponse, callRecordEndpoint,
  ] = useEndpoint([401], recordFetch);

  const readFetch = () => (
    fetchEndpoint(
      '/book/read_book',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            token,
            book_id: bookId,
          },
        ),
      },
    ));

  const [
    readResponseCode, readResponse, callReadEndpoint,
  ] = useEndpoint([], readFetch);

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!emptyFields) {
      callRecordEndpoint();
      waitingForBoth = true;
    }
    callReadEndpoint();
    setServerError('');
  };

  useEffect(() => {
    if (recordResponseCode === 200 && (!waitingForBoth || readResponseCode === 200)) {
      navigate(0);
    } else if (recordResponse?.message) {
      setServerError(recordResponse.message);
    }
  }, [recordResponseCode, recordResponse]);

  useEffect(() => {
    if (readResponseCode === 200 && (!waitingForBoth || recordResponseCode === 200)) {
      navigate(0);
    } else if (readResponse?.message && (emptyFields || !serverError)) {
      setServerError(readResponse.message);
    } else if (readResponseCode !== 0 && (emptyFields || !serverError)) {
      setServerError('Something went wrong marking this book as read, please try again later.');
    }
  }, [readResponseCode, readResponse]);

  return (
    <Form onSubmit={onSubmit} sx={{ marginTop: '5%' }}>
      <Box sx={{
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%',
      }}
      >
        <Typography variant="h6" align="center" sx={{ flex: '1 1 25%' }}>Rating (optional)</Typography>
        <Rating name="rating" value={rating} precision={1} onChange={(event) => setRating(Number(event.target.value))} />
        <Box sx={{ flex: '1 1 25%', display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" type="button" onClick={() => setRating(0)}>Clear</Button>
        </Box>
      </Box>
      <TextField
        id="input-settings-review"
        label="Review (optional)"
        multiline
        minRows={4}
        variant="outlined"
        sx={{ width: '50%' }}
        onChange={(event) => setReviewText(event.target.value)}
      />
      {serverError && <FormHelperText error>{serverError}</FormHelperText>}
      <Button variant="contained" sx={{ width: '150px' }} type="submit">{emptyFields ? 'Mark as Read' : 'Save'}</Button>
    </Form>
  );
}

function RecordBookDialogButton({ bookId }) {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm" PaperProps={{ sx: { maxHeight: '100%' } }}>
        <RecordBookForm bookId={bookId} />
      </Dialog>
      <Button variant="contained" sx={{ width: 'fit-content', color: '#fff' }} onClick={handleToggle}>Record Book</Button>
    </>
  );
}

export default RecordBookDialogButton;
