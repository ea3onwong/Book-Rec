import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Cookies from 'js-cookie';
import { React, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchEndpoint from '../../fetchEndpoint';
import useEndpoint from '../../hooks/useEndpoint';

function CollectionDeleteBookButton({ collectionName, bookId, sx }) {
  const token = Cookies.get('token');
  const navigate = useNavigate();

  const deleteFetch = () => (
    fetchEndpoint(
      '/collections/remove_book',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            token,
            bookid: bookId,
            collection: collectionName,
          },
        ),
      },
    ));

  const [
    deleteResponseCode, deleteResponse, callDeleteEndpoint,
  ] = useEndpoint([], deleteFetch);

  const onClick = () => {
    callDeleteEndpoint();
  };

  useEffect(() => {
    if (deleteResponseCode === 200) {
      navigate(0);
    } else if (deleteResponseCode === 400 && deleteResponse?.message?.includes('token')) {
      navigate('/login-invalid');
    } else if (deleteResponseCode !== 200 && deleteResponseCode !== 0) {
      // TODO: some sort of error handling
    }
  }, [deleteResponseCode, deleteResponse]);

  return (
    <Button variant="text" onClick={onClick} sx={{ width: 'fit-content', ...sx }}>
      <DeleteIcon />
    </Button>
  );
}

export default CollectionDeleteBookButton;
