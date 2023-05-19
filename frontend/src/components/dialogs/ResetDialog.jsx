import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import { React, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import fetchEndpoint from '../../fetchEndpoint';
import useEndpoint from '../../hooks/useEndpoint';
import Form from '../forms/Form';
import PasswordField from '../forms/PasswordField';

function ResetForm() {
  const navigate = useNavigate();
  const [, setSubmitted] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  const [serverError, setServerError] = useState('');
  const passwordsMatch = password === passwordConfirm || !passwordConfirm || !password;
  const emptyFields = !password || !passwordConfirm;

  const fetchReset = () => (
    fetchEndpoint(
      '/auth/reset',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          { password, token: resetToken },
        ),
      },
    ));

  const [
    resetResponseCode, resetResponse, callResetEndpoint,
  ] = useEndpoint([], fetchReset);

  useEffect(() => {
    if (resetResponseCode === 200) {
      setServerError('');
      navigate('/');
      navigate(0);
    } else if (resetResponseCode !== 0) {
      try {
        if (resetResponse.message) setServerError(resetResponse.message);
      } catch (e) {
        setServerError('Something went wrong. Please try again.');
      }
    }
  }, [resetResponseCode, resetResponse]);

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!emptyFields && passwordsMatch) {
      callResetEndpoint();
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <PasswordField id="input-password" label="Enter New Password" variant="outlined" sx={{ width: '50%' }} onChange={(event) => setPassword(event.target.value)} validateComplexity />
      <PasswordField id="input-password-confirm" label="Re-Enter New Password" variant="outlined" sx={{ width: '50%' }} error={!passwordsMatch} helperText={passwordsMatch ? '' : 'Passwords do not match.'} onChange={(event) => setPasswordConfirm(event.target.value)} />
      {serverError && <FormHelperText error>{serverError}</FormHelperText>}
      {resetResponseCode === 200 && (
        <FormHelperText error={false}>Password was reset! Please login again.</FormHelperText>
      )}
      <Button variant="contained" sx={{ width: '200px' }} type="submit">Reset Password</Button>
    </Form>
  );
}

function ResetDialog({ enabled }) {
  const [open, setOpen] = useState(enabled);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm" PaperProps={{ sx: { maxHeight: '100%' } }}>
      <DialogTitle align="center" sx={{ marginTop: '2%' }}>Reset Password</DialogTitle>
      <ResetForm />
    </Dialog>
  );
}

export default ResetDialog;
