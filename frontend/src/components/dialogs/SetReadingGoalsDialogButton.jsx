import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Cookies from 'js-cookie';
import { React, useEffect, useState } from 'react';
import fetchEndpoint from '../../fetchEndpoint';
import useEndpoint from '../../hooks/useEndpoint';
import Form from '../forms/Form';

function SetReadingGoalsForm() {
  const timeframes = ['week', 'month', 'year'];
  const [serverError, setServerError] = useState('');
  const [numBooks, setNumBooks] = useState(0);
  const [timeframe, setTimeframe] = useState(timeframes[1]);
  const [submitted, setSubmitted] = useState(false);
  const emptyFields = !timeframe || !numBooks;
  const token = Cookies.get('token');

  const [responseCode, response, callEndpoint] = useEndpoint([], () => (
    fetchEndpoint(
      '/user/set_read_goal',
      {
        method: 'POST',
        body: JSON.stringify({ token, timeframe, num_books: numBooks }),
        headers: { 'Content-Type': 'application/json' },
      },
    )
  ));

  const handleChange = (event) => {
    setTimeframe(event.target.value);
  };

  const updateNumBooks = (event) => {
    const newNum = event.target.value;

    try {
      const n = parseInt(newNum, 10);
      if (n < 1) {
        setNumBooks(1);
      } else {
        setNumBooks(n);
      }
    } catch (e) {
      setNumBooks(1);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!emptyFields && token) {
      callEndpoint();
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
        <Box sx={{
          display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '0 1rem', flexWrap: 'wrap',
        }}
        >
          <Typography>I want to read&nbsp;</Typography>
          <TextField
            label="Number of Books"
            variant="outlined"
            sx={{ width: 'fit-content' }}
            onChange={updateNumBooks}
            value={numBooks}
            type="number"
            min="1"
          />
          <Typography>&nbsp;books every&nbsp;</Typography>
          <FormControl>
            <InputLabel id="timeframe-label">Timeframe</InputLabel>
            <Select
              value={timeframe}
              id="timeframe-label"
              label="Timeframe"
              onChange={handleChange}
            >
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {submitted && emptyFields && (
          <FormHelperText error>Please select a collection.</FormHelperText>
        )}
        {serverError && (
          <FormHelperText error>{serverError}</FormHelperText>
        )}
        {responseCode === 200 && (
          <FormHelperText>New reading goal set.</FormHelperText>
        )}
        <Button variant="contained" sx={{ width: '150px' }} type="submit">Save</Button>
      </Box>
    </Form>
  );
}

function SetReadingGoalsDialogButton() {
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
        <DialogTitle align="center" sx={{ marginTop: '2%' }}>Set Reading Goals</DialogTitle>
        <SetReadingGoalsForm />
      </Dialog>
      <Button variant="contained" sx={{ width: 'fit-content', color: '#fff' }} onClick={handleToggle}>Set Reading Goals</Button>
    </>
  );
}

export default SetReadingGoalsDialogButton;
