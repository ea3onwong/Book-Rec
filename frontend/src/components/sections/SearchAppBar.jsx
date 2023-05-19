import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SearchIcon from '@mui/icons-material/Search';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import Cookies from 'js-cookie';
import React from 'react';
import ProfileMenu from '../dialogs/ProfileMenu';
import SignInDialogButton from '../dialogs/SignInDialogButton';

/**
 * Code adapted from https://mui.com/material-ui/react-app-bar/
 */

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

function SearchAppBar({ hideProfile }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-evenly' }}>
          <Link
            href="/"
            sx={{
              color: '#FFF', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', textDecoration: 'none',
            }}
          >
            <MenuBookRoundedIcon />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                display: 'block', fontWeight: 900, userSelect: 'none',
              }}
            >
              BookRec
            </Typography>
          </Link>
          <Box sx={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '3rem',
          }}
          >
            <Box sx={{ display: 'flex' }}>
              <Button href="/home" sx={{ color: '#fff' }}>Home</Button>
              <Button href="/collections" sx={{ color: '#fff' }}>Collections</Button>
              <Button href="/books" sx={{ color: '#fff' }}>Books</Button>
            </Box>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <form action="/search" method="GET">
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ name: 'query', 'aria-label': 'search' }}
                />
                <input type="submit" hidden />
              </form>
            </Search>
            {!hideProfile && (
              <Box sx={{ display: 'block' }}>
                {Cookies.get('token') ? <ProfileMenu /> : <SignInDialogButton />}
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default SearchAppBar;
