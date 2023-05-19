import EditIcon from '@mui/icons-material/Edit';
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

function EditReviewForm({ reviewId, reviewText, rating }) {
  const navigate = useNavigate();
  const [newReviewText, setNewReviewText] = useState(reviewText);
  const [newRating, setNewRating] = useState(rating);
  const [, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const emptyFields = !(newRating || newReviewText);
  const token = Cookies.get('token');

  const recordFetch = () => (
    fetchEndpoint(
      '/review/edit_review',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            token,
            review_id: reviewId,
            ...newReviewText && { review_text: newReviewText },
            ...(newRating !== rating) && { rating: newRating },
          },
        ),
      },
    ));

  const [
    editResponseCode, editResponse, callEditEndpoint,
  ] = useEndpoint([401], recordFetch);

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!emptyFields) {
      callEditEndpoint();
    }

    setServerError('');
  };

  useEffect(() => {
    if (editResponseCode === 200) {
      navigate(0);
    } else if (editResponse?.message) {
      setServerError(editResponse.message);
    }
  }, [editResponseCode, editResponse]);

  return (
    <Form onSubmit={onSubmit} sx={{ marginTop: '5%' }}>
      <Box sx={{
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%',
      }}
      >
        <Typography variant="h6" align="center" sx={{ flex: '1 1 25%' }}>Rating (optional)</Typography>
        <Rating name="rating" value={newRating} precision={1} onChange={(event) => setNewRating(Number(event.target.value))} />
        <Box sx={{ flex: '1 1 25%', display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" type="button" onClick={() => setNewRating(0)}>Clear</Button>
        </Box>
      </Box>
      <TextField
        id="input-settings-review"
        label="Review (optional)"
        multiline
        minRows={4}
        variant="outlined"
        sx={{ width: '50%' }}
        value={newReviewText}
        onChange={(event) => setNewReviewText(event.target.value)}
      />
      {serverError && <FormHelperText error>{serverError}</FormHelperText>}
      <Button variant="contained" sx={{ width: '150px' }} type="submit">{emptyFields ? 'Mark as Read' : 'Save'}</Button>
    </Form>
  );
}

function EditReviewDialogButton({
  reviewId, reviewText, rating, sx,
}) {
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
        <EditReviewForm reviewId={reviewId} reviewText={reviewText} rating={rating} />
      </Dialog>
      <Button variant="outlined" startIcon={<EditIcon />} onClick={handleToggle} sx={{ width: 'fit-content', ...sx }}>
        Edit
      </Button>
    </>
  );
}

export default EditReviewDialogButton;
