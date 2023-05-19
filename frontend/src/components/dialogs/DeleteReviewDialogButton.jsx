import DeleteIcon from '@mui/icons-material/Delete';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import FormHelperText from '@mui/material/FormHelperText';
import Cookies from 'js-cookie';
import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchEndpoint from '../../fetchEndpoint';
import useEndpoint from '../../hooks/useEndpoint';
import Form from '../forms/Form';

function DeleteForm({ reviewId }) {
  const navigate = useNavigate();
  const [, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const token = Cookies.get('token');

  const deleteFetch = () => (
    fetchEndpoint(
      '/review/delete_review',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            token,
            review_id: reviewId,
          },
        ),
      },
    ));

  const [
    deleteResponseCode, deleteResponse, callDeleteEndpoint,
  ] = useEndpoint([401], deleteFetch);

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    callDeleteEndpoint();
    setServerError('');
  };

  useEffect(() => {
    if (deleteResponseCode === 200) {
      navigate(0);
    } else if (deleteResponse?.message) {
      setServerError(deleteResponse.message);
    }
  }, [deleteResponseCode, deleteResponse]);

  return (
    <Form onSubmit={onSubmit} sx={{ marginTop: '5%' }}>
      <Typography variant="body1">Are you sure you want to delete this review?</Typography>
      <Button variant="contained" sx={{ width: '150px' }} type="submit">Delete</Button>
      {serverError && <FormHelperText error>{serverError}</FormHelperText>}
    </Form>
  );
}

function EditReviewDialogButton({ reviewId, sx }) {
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
        <DeleteForm reviewId={reviewId} />
      </Dialog>
      <Button variant="outlined" startIcon={<DeleteIcon />} onClick={handleToggle} sx={{ width: 'fit-content', ...sx }}>
        Delete
      </Button>
    </>
  );
}

export default EditReviewDialogButton;
