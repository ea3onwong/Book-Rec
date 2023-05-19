import { TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import Cookies from 'js-cookie';
import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchEndpoint from '../../fetchEndpoint';
import useEndpoint from '../../hooks/useEndpoint';
import Form from '../forms/Form';

function CreateCollectionForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const token = Cookies.get('token');
  const navigate = useNavigate();

  const createCollection = () => (
    fetchEndpoint(
      '/collections/create',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, token }),
      },
    ));

  const [
    createCollectionResponseCode, createCollectionResponse, callCreateCollectionEndpoint,
  ] = useEndpoint([401], createCollection);

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (name && token) {
      callCreateCollectionEndpoint();
    }
  };

  useEffect(() => {
    if (createCollectionResponseCode === 200) {
      navigate(0);
    }
  }, [createCollectionResponseCode, createCollectionResponse]);

  return (
    <Form onSubmit={onSubmit}>
      <TextField id="input-collection-name" label="Name of Collection" variant="outlined" type="text" sx={{ width: '50%' }} onChange={(event) => setName(event.target.value)} />
      <TextField id="input-collection-description" multiline minRows={4} label="Description" variant="outlined" type="text" sx={{ width: '50%' }} onChange={(event) => setDescription(event.target.value)} />
      {submitted && !name && (
        <FormHelperText error>Please fill in the name of the collection.</FormHelperText>
      )}
      {createCollectionResponse && createCollectionResponse.status === 200 && (
        <FormHelperText error={false}>Collection created successfully!</FormHelperText>
      )}
      {createCollectionResponse && createCollectionResponse.status === 401 && (
        <FormHelperText error>Login details are invalid, please login again.</FormHelperText>
      )}
      {createCollectionResponse && createCollectionResponse.status === 402 && (
        <FormHelperText error>Collection name needs to be at least 1 character.</FormHelperText>
      )}
      {createCollectionResponse && createCollectionResponse.status === 403 && (
        <FormHelperText error>Collection name is already in use.</FormHelperText>
      )}
      <Button variant="contained" sx={{ width: '150px' }} type="submit">Publish</Button>
    </Form>
  );
}

function CreateCollectionDialogButton() {
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
        <DialogTitle align="center" sx={{ marginTop: '2%' }}>Create a Collection</DialogTitle>
        <CreateCollectionForm />
      </Dialog>
      <Button variant="contained" sx={{ width: '220px' }} onClick={handleToggle}>Create a Collection</Button>
    </>
  );
}

export default CreateCollectionDialogButton;
