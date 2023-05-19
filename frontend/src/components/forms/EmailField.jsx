import { TextField } from '@mui/material';
import { React, useEffect } from 'react';

// Regex from https://www.w3resource.com/javascript/form/email-validation.php
function isEmailValid(email) {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

function EmailField({
  id, label, variant, sx, setEmailIsValid, email, setEmail, onChange,
}) {
  // Update after render so react doesnt get mad,
  // also only update when email changes for performance
  useEffect(() => {
    setEmailIsValid(isEmailValid(email));
  }, [email, setEmailIsValid]);

  return (
    <TextField
      id={id}
      label={label}
      variant={variant}
      sx={sx}
      type="email"
      name="email"
      error={!!(email && !isEmailValid(email))}
      helperText={!email || isEmailValid(email) ? '' : 'Email is invalid'}
      onChange={(event) => {
        if (onChange) onChange(event);
        setEmail(event.target.value);
      }}
    />
  );
}

export default EmailField;
