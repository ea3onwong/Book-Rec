import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Cookies from 'js-cookie';
import {
  React, useEffect, useState,
} from 'react';
import fetchEndpoint from '../../fetchEndpoint';
import useEndpoint from '../../hooks/useEndpoint';
import StyledCarousel from '../StyledCarousel';
import BookCard from '../cards/BookCard';

function GeneralRecommendations() {
  const token = Cookies.get('token');
  const [recData, setRecData] = useState([]);
  const [responseCode, response, callGetRecsEndpoint] = (
    useEndpoint([], () => (
      fetchEndpoint(`/rec/?token=${token}`, { method: 'GET' }))));

  useEffect(() => {
    callGetRecsEndpoint();
  }, []);

  useEffect(() => {
    if (responseCode === 200 && response && response.rec) {
      setRecData([...response.rec]);
    }
  }, [responseCode, response]);

  const bookCards = recData.map((book) => (
    <BookCard
      key={book.book_id}
      link={`/book/${book.book_id}`}
      title={book.title}
      author={book.authors}
      img={book.image_link === 'No image available' ? null : book.image_link}
      year={new Date(book.publication_date)?.getFullYear() || null}
      avgRating={book.average_rating === 'No rating available' ? 0 : book.average_rating}
    />
  ));

  return (
    <>
      <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
      <Typography variant="h4">Recommended for You</Typography>
      <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
      {bookCards.length > 0 && (
        <StyledCarousel sx={{ width: '100%' }}>
          {bookCards}
        </StyledCarousel>
      )}
      {responseCode === 0 && (
        <CircularProgress sx={{ margin: '0 auto' }} />
      )}
      {responseCode !== 200 && responseCode !== 0 && (
        <Typography variant="subtitle1">Read at least a few books to get recommendations!</Typography>
      )}
    </>
  );
}

export default GeneralRecommendations;
