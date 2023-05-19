import { ThemeProvider } from '@mui/material/styles';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import theme from './components/theme';
import './index.css';
import Book from './routes/Book';
import Books from './routes/Books';
import Collection from './routes/Collection';
import Collections from './routes/Collections';
import Error from './routes/Error';
import Home from './routes/Home';
import Profile from './routes/Profile';
import Root from './routes/Root';
import Search from './routes/Search';
import loader from './routes/jwtLoader';

const errorElement = <Error />;

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement,
    loader,
  },
  {
    path: '/home',
    element: <Home />,
    errorElement,
    loader,
  },
  {
    path: '/reset',
    element: <Root reset />,
    errorElement,
    loader,
  },
  {
    path: '/profile/:id',
    element: <Profile />,
    errorElement,
    loader,
  },
  {
    path: '/profile/:id/collection/:num',
    element: <Collection />,
    errorElement,
    loader,
  },
  {
    path: '/profile/:id/collection-main',
    element: <Collection main />,
    errorElement,
    loader,
  },
  {
    path: '/collections',
    element: <Collections />,
    errorElement,
    loader,
  },
  {
    path: '/collection/:num',
    element: <Collection />,
    errorElement,
    loader,
  },
  {
    path: '/collection-main',
    element: <Collection main />,
    errorElement,
    loader,
  },
  {
    path: '/logout',
    element: <Root logout />,
    errorElement,
    loader,
  },
  {
    path: '/logout-invalid',
    element: <Root logout invalid />,
    errorElement,
    loader,
  },
  {
    path: '/invalid',
    element: <Root invalid />,
    errorElement,
    loader,
  },
  {
    path: '/search',
    element: <Search />,
    errorElement,
    loader,
  },
  {
    path: '/books',
    element: <Books />,
    errorElement,
    loader,
  },
  {
    path: '/book/:id',
    element: <Book />,
    errorElement,
    loader,
  },
  {
    path: '/404',
    element: <Error />,
    errorElement,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
