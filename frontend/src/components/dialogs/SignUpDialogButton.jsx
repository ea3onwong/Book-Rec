import { TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Cookies from 'js-cookie';
import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchEndpoint from '../../fetchEndpoint';
import EmailField from '../forms/EmailField';
import Form from '../forms/Form';
import PasswordField from '../forms/PasswordField';
import TermsAndConditionsDialogLink from './TermsAndConditionsDialogLink';

function SignUpForm() {
  const navigate = useNavigate();
  const [emailIsValid, setEmailIsValid] = useState(true);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [checkbox, setCheckbox] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const passwordsMatch = password === passwordConfirm || !password || !passwordConfirm;
  const emptyFields = !firstname || !lastname || !username || !password || !passwordConfirm;
  const [email, setEmail] = useState('');
  const [serverError, setServerError] = useState('');

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (emailIsValid && passwordsMatch && !emptyFields && checkbox) {
      fetchEndpoint(
        '/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            {
              username, first_name: firstname, last_name: lastname, password, email_address: email,
            },
          ),
        },
      ).then((response) => Promise.all([response.text(), response.status]))
        .then(([data, responseCode]) => {
          if (responseCode === 200) {
            Cookies.set('token', data);
            setServerError('');
            navigate('/');
            navigate(0);
          } else if (responseCode === 400) {
            try {
              setServerError(JSON.parse(data).message);
            } catch (e) {
              setServerError('Something went wrong. Please try again.');
            }
          }
        });
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <EmailField id="input-email" label="Email" variant="outlined" sx={{ width: '50%' }} email={email} setEmail={setEmail} setEmailIsValid={setEmailIsValid} />
      <TextField id="input-username" label="Username" variant="outlined" type="text" sx={{ width: '50%' }} onChange={(event) => setUsername(event.target.value)} />
      <TextField id="input-firstname" label="First Name" variant="outlined" type="text" sx={{ width: '50%' }} onChange={(event) => setFirstname(event.target.value)} />
      <TextField id="input-lastname" label="Last Name" variant="outlined" type="text" sx={{ width: '50%' }} onChange={(event) => setLastname(event.target.value)} />
      <PasswordField id="input-password" label="Password" variant="outlined" sx={{ width: '50%' }} onChange={(event) => setPassword(event.target.value)} validateComplexity />
      <PasswordField id="input-password-confirm" label="Confirm Password" variant="outlined" sx={{ width: '50%' }} error={!passwordsMatch} helperText={passwordsMatch ? '' : 'Passwords do not match.'} onChange={(event) => setPasswordConfirm(event.target.value)} />
      {submitted && emptyFields && (
        <FormHelperText error>Please fill in all the fields.</FormHelperText>
      )}
      {submitted && !emptyFields && !checkbox && (
        <FormHelperText error>Please accept the terms and conditions.</FormHelperText>
      )}
      {serverError && <FormHelperText error>{serverError}</FormHelperText>}
      <FormControlLabel
        control={<Checkbox />}
        onChange={(event) => setCheckbox(event.target.checked)}
        label={(
          <TermsAndConditionsDialogLink />
        )}
      />
      <Button variant="contained" sx={{ width: '150px' }} type="submit">Sign Up</Button>
    </Form>
  );
}

function SignUpDialogButton() {
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
        <DialogTitle align="center" sx={{ marginTop: '2%' }}>Sign Up</DialogTitle>
        <SignUpForm />
      </Dialog>
      <Button variant="contained" sx={{ width: '150px' }} onClick={handleToggle}>Sign Up</Button>
    </>
  );
}

export default SignUpDialogButton;
