import { TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Cookies from 'js-cookie';
import { React, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import fetchEndpoint from '../../fetchEndpoint';
import useEndpoint from '../../hooks/useEndpoint';
import Form from '../forms/Form';
import PasswordField from '../forms/PasswordField';
import ForgotDialogLink from './ForgotDialogLink';

function SignInForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [enabled, setEnabled] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [checkbox, setCheckbox] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const emptyFields = !username || !password;

  const loginFetch = () => fetchEndpoint(
    '/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        { username, email_address: username, password },
      ),
    },
  );

  const [
    loginResponseCode, loginResponse, callLoginEndpoint,
  ] = useEndpoint([], loginFetch);

  const onSubmit = (event) => {
    if (!enabled) return; // if the dialog is disabled, don't submit (if the forgot dialog is open)
    event.preventDefault();
    setSubmitted(true);

    if (!emptyFields) {
      callLoginEndpoint();
    }
  };

  useEffect(() => {
    if (loginResponseCode === 200) {
      Cookies.set('token', loginResponse, { expires: (checkbox ? 30 : '') });

      setServerError('');
      if (location.pathname === '/') {
        navigate(0); // just refresh
      } else {
        navigate('/');
      }
    } else if (loginResponseCode === 400 && loginResponse?.message) {
      setServerError(loginResponse.message);
    }
  }, [loginResponseCode, loginResponse]);

  return (
    <Form onSubmit={onSubmit}>
      <TextField id="input-email-or-username" label="Email or Username" variant="outlined" type="text" sx={{ width: '50%' }} onChange={(event) => setUsername(event.target.value)} />
      <PasswordField id="input-password" label="Password" variant="outlined" sx={{ width: '50%' }} onChange={(event) => setPassword(event.target.value)} />
      {submitted && emptyFields && (
        <FormHelperText error>Please fill in all the fields.</FormHelperText>
      )}
      {serverError && <FormHelperText error>{serverError}</FormHelperText>}
      <FormControlLabel
        control={<Checkbox />}
        onChange={(event) => setCheckbox(event.target.checked)}
        label={<Typography>Remember me</Typography>}
      />
      <ForgotDialogLink onOpen={() => setEnabled(false)} onClose={() => setEnabled(true)} />
      <Button variant="contained" sx={{ width: '150px' }} type="submit">Sign In</Button>
    </Form>
  );
}

function SignInDialogButton() {
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
        <DialogTitle align="center" sx={{ marginTop: '2%' }}>Sign In</DialogTitle>
        <SignInForm />
      </Dialog>
      <Button sx={{ color: '#fff' }} onClick={handleToggle}>Sign in</Button>
    </>
  );
}

export default SignInDialogButton;
