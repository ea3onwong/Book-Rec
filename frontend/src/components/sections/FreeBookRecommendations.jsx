import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import {
  React, useEffect, useState,
} from 'react';
import fetchEndpoint from '../../fetchEndpoint';
import useEndpoint from '../../hooks/useEndpoint';
import StyledCarousel from '../StyledCarousel';
import BookCard from '../cards/BookCard';

function FreeBookRecommendations() {
  const [freeRecData, setFreeRecData] = useState([]);
  const [responseCode, response, callGetFreeBookEndpoint] = (
    useEndpoint([], () => (
      fetchEndpoint('/book/get_free_books', { method: 'GET' }))));

  useEffect(() => {
    callGetFreeBookEndpoint();
  }, []);

  useEffect(() => {
    if (responseCode === 200) {
      setFreeRecData([...response]);
    }
  }, [responseCode, response]);

  const bookCards = freeRecData.map((book) => (
    <BookCard
      key={book.book_id}
      link={`/book/${book.book_id}`}
      title={book.title}
      author={book.authors}
      img={book.image_link === 'No image available' ? null : book.image_link}
      year={new Date(book.publication_date).getFullYear()}
      avgRating={book.average_rating === 'No rating available' ? 0 : book.average_rating}
    />
  ));

  return (
    <>
      <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
      <Typography variant="h4">Free to Read with Google Books</Typography>
      <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
      {bookCards.length > 0 && (
        <StyledCarousel sx={{ width: '100%' }}>
          {bookCards}
        </StyledCarousel>
      )}
      {responseCode === 0 && (
        <CircularProgress sx={{ margin: '0 auto' }} />
      )}
      {responseCode !== 0 && response?.length === 0 && (
        <Typography variant="subtitle1">No books found</Typography>
      )}
    </>
  );
}

export default FreeBookRecommendations;
