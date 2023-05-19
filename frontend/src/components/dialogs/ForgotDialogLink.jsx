import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import { React, useEffect, useState } from 'react';
import fetchEndpoint from '../../fetchEndpoint';
import useEndpoint from '../../hooks/useEndpoint';
import EmailField from '../forms/EmailField';
import Form from '../forms/Form';

function ForgotForm() {
  const [email, setEmail] = useState('');
  const [emailIsValid, setEmailIsValid] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const recoverFetch = () => (
    fetchEndpoint(
      '/auth/recover',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          { email },
        ),
      },
    ));

  const [
    responseCode, response, callRecoverEndpoint,
  ] = useEndpoint([], recoverFetch);

  const onSubmit = (event) => {
    setSubmitted(true);
    event.preventDefault();

    if (email && emailIsValid) {
      callRecoverEndpoint();
    }
  };

  useEffect(() => {
    if (responseCode === 200) {
      setServerError('');
    } else if (response) {
      try {
        if (response.message) setServerError(response.message);
      } catch (e) {
        setServerError('Something went wrong. Please try again.');
      }
    }
  }, [responseCode, response]);

  return (
    <Form onSubmit={onSubmit}>
      <EmailField id="input-forgot-email" label="Email" variant="outlined" sx={{ width: '50%' }} email={email} setEmail={setEmail} setEmailIsValid={setEmailIsValid} />
      {submitted && !email && <FormHelperText error>Please fill in your email.</FormHelperText>}
      {serverError && <FormHelperText error>{serverError}</FormHelperText>}
      {responseCode === 200 && <FormHelperText error={false}>Email sent!</FormHelperText>}
      <Button variant="contained" sx={{ width: '200px' }} type="submit">Send Reset Link</Button>
    </Form>
  );
}

function ForgotDialogLink({ onOpen, onClose }) {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleToggle = () => {
    if (open) onClose();
    else onOpen();

    setOpen(!open);
  };

  return (
    <>
      <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm" PaperProps={{ sx: { maxHeight: '100%' } }}>
        <DialogTitle align="center" sx={{ marginTop: '2%' }}>Reset Password</DialogTitle>
        <ForgotForm />
      </Dialog>
      { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
      <Link component="button" type="button" onClick={handleToggle}>Forgot password?</Link>
    </>
  );
}

export default ForgotDialogLink;
