import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { TextField } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { React, useState } from 'react';

// Code adapted from https://mui.com/material-ui/react-text-field/
function PasswordField({
  id, label, variant, sx, onChange, error, helperText, validateComplexity,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const validatePasswordComplexity = () => {
    if (!validateComplexity || password.length === 0) return true;

    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[^A-Za-z0-9]/.test(password)) return false;

    return true;
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const childOnChange = (event) => {
    onChange(event);
    setPassword(event.target.value);
  };

  const endAdornment = (
    <InputAdornment position="end">
      <IconButton
        aria-label="toggle password visibility"
        onClick={handleClickShowPassword}
        onMouseDown={handleMouseDownPassword}
        edge="end"
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <FormControl variant={variant} sx={sx}>
      <TextField
        id={id}
        type={showPassword ? 'text' : 'password'}
        variant={variant}
        InputProps={{ endAdornment }}
        label={label}
        onChange={childOnChange}
        error={!validatePasswordComplexity() || error}
        helperText={!validatePasswordComplexity() ? 'Password needs to be at least 8 characters, contain an uppercase, lowercase, digit and a special character.' : helperText}
      />
    </FormControl>
  );
}

export default PasswordField;
