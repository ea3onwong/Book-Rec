import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import Cookies from 'js-cookie';
import { React, useEffect, useState } from 'react';
import fetchEndpoint from '../../fetchEndpoint';
import useEndpoint from '../../hooks/useEndpoint';
import Form from '../forms/Form';

function AddToCollectionsForm({ bookId, collectionNames }) {
  const [collection, setCollection] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const emptyFields = !collection;
  const token = Cookies.get('token');
  const hasCollections = collectionNames && collectionNames.length > 0;

  const [responseCode, response, callEndpoint] = useEndpoint([], () => (
    fetchEndpoint(
      '/collections/add_book',
      {
        method: 'POST',
        body: JSON.stringify({ collection, token, bookid: bookId }),
        headers: { 'Content-Type': 'application/json' },
      },
    )
  ));

  const handleChange = (event) => {
    setCollection(event.target.value);
  };

  const radios = collectionNames.map((name) => (
    <FormControlLabel
      key={name}
      value={name}
      control={<Radio />}
      label={name}
    />
  ));

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!emptyFields && token) {
      callEndpoint(collection);
    } else if (!token) {
      setServerError('Please login again.');
    }
  };

  useEffect(() => {
    if (responseCode === 200) {
      setServerError('');
    } else if (response?.message?.includes('token')) {
      setServerError('Please login again.');
    } else if (response?.message) {
      setServerError(response.message);
    } else if (responseCode !== 0 && responseCode !== 200) {
      setServerError('Something went wrong. Please try again later.');
    }
  }, [response, responseCode]);

  return (
    <Form onSubmit={onSubmit} sx={{ marginTop: '5%' }}>
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '2rem 0',
      }}
      >
        {hasCollections ? (
          <FormControl>
            <FormLabel id="radio-buttons-group-label" align="center">Add to Collections</FormLabel>
            <RadioGroup
              aria-labelledby="radio-buttons-group-label"
              name="radio-buttons-group"
              onChange={handleChange}
              value={collection}
            >
              {radios}
            </RadioGroup>
          </FormControl>
        ) : (
          <Typography variant="subtitle1">You have no collections.</Typography>
        )}
        {submitted && emptyFields && (
          <FormHelperText error>Please select a collection.</FormHelperText>
        )}
        {serverError && (
          <FormHelperText error>{serverError}</FormHelperText>
        )}
        {responseCode === 200 && (
          <FormHelperText>Added to collection</FormHelperText>
        )}
        {hasCollections && <Button variant="contained" sx={{ width: '150px' }} type="submit">Save</Button>}
      </Box>
    </Form>
  );
}

function AddToCollectionsDialogButton({ bookId, collectionNames }) {
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
        <AddToCollectionsForm bookId={bookId} collectionNames={collectionNames} />
      </Dialog>
      <Button variant="contained" sx={{ width: 'fit-content', color: '#fff' }} onClick={handleToggle}>Add to Collections</Button>
    </>
  );
}

export default AddToCollectionsDialogButton;
