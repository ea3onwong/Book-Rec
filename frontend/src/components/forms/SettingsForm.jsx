import { TextField } from '@mui/material';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Cookies from 'js-cookie';
import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchEndpoint from '../../fetchEndpoint';
import EmailField from './EmailField';
import Form from './Form';
import PasswordField from './PasswordField';

function SettingsForm() {
  const navigate = useNavigate();
  const [emailIsValid, setEmailIsValid] = useState(true);
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [responseCode, setResponseCode] = useState(0);
  const passwordsMatch = passwordNew === passwordConfirm;
  const anyFields = firstname || lastname || username || bio || email
   || (passwordNew && passwordConfirm);

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if ((emailIsValid || !email) && anyFields) {
      const options = {
        token: Cookies.get('token'),
        ...email && { email_address: email },
        ...firstname && { firstname },
        ...lastname && { lastname },
        ...username && { username },
        ...bio && { bio },
        ...passwordNew && { new_password: passwordNew },
        ...password && { current_password: password },
      };

      fetchEndpoint(
        '/user/edit',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options),
        },
      ).then((response) => Promise.all([response.json(), response.status]))
        .then(([data, code]) => {
          setResponseCode(code);
          if (code === 200) {
            Cookies.remove('token');
            Cookies.set('token', data.token);
            setServerError('');
          } else if (code === 403) {
            setServerError('Invalid login. Please login again.');
            navigate('/logout-invalid');
          } else if (data.message) {
            try {
              setServerError(data.message);
            } catch (e) {
              setServerError('Something went wrong. Please try again.');
            }
          }
        });
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <EmailField id="input-settings-email" label="Email" variant="outlined" sx={{ width: '50%' }} setEmailIsValid={setEmailIsValid} setEmail={setEmail} email={email} />
      <TextField id="input-settings-username" label="Username" variant="outlined" type="text" sx={{ width: '50%' }} onChange={(event) => setUsername(event.target.value)} />
      <TextField id="input-settings-firstname" label="First Name" variant="outlined" type="text" sx={{ width: '50%' }} onChange={(event) => setFirstname(event.target.value)} />
      <TextField id="input-settings-lastname" label="Last Name" variant="outlined" type="text" sx={{ width: '50%' }} onChange={(event) => setLastname(event.target.value)} />
      <TextField id="input-settings-bio" label="Bio" multiline rows={4} variant="outlined" sx={{ width: '50%' }} onChange={(event) => setBio(event.target.value)} />
      <PasswordField id="input-settings-password" label="Current Password" variant="outlined" sx={{ width: '50%' }} onChange={(event) => setPassword(event.target.value)} />
      <PasswordField id="input-settings-password-new" label="New Password" variant="outlined" sx={{ width: '50%' }} onChange={(event) => setPasswordNew(event.target.value)} />
      <PasswordField id="input-settings-password-confirm" label="Confirm New Password" variant="outlined" sx={{ width: '50%' }} error={!passwordsMatch} helperText={passwordsMatch ? '' : 'Passwords do not match.'} onChange={(event) => setPasswordConfirm(event.target.value)} />
      {submitted && !anyFields && (
        <FormHelperText error>Please fill in a field to update.</FormHelperText>
      )}
      {submitted && !serverError && responseCode === 200 && (
        <FormHelperText error={false}>Successfully updated!</FormHelperText>
      )}
      {serverError && <FormHelperText error>{serverError}</FormHelperText>}
      {/* {submitted && anyFields && !password && (
        <FormHelperText error={true}>Please enter your current password to submit.</FormHelperText>}
      ) */}
      <Button variant="contained" sx={{ width: '150px' }} type="submit">Save</Button>
    </Form>
  );
}

export default SettingsForm;
