import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Cookies from 'js-cookie';
import {
  Fragment,
  React,
  useEffect, useState,
} from 'react';
import fetchEndpoint from '../../fetchEndpoint';
import useEndpoint from '../../hooks/useEndpoint';
import StyledCarousel from '../StyledCarousel';
import BookCard from '../cards/BookCard';

function NYTBookRecommendations() {
  const token = Cookies.get('token');
  const [nytRecData, setNytRecData] = useState([]);
  const lists = ['combined-print-and-e-book-fiction', 'combined-print-and-e-book-nonfiction'];
  const listDisplayNames = ["Current New York Time's Bestseller's List for Fiction", "Current New York Time's Bestseller's List for Nonfiction"];
  const [responseCode, response, callGetNYTBookRecommendationsEndpoint] = (
    useEndpoint([], () => (
      fetchEndpoint(`/nyt/get_current_recommendations?token=${encodeURIComponent(token)}`, { method: 'GET' }))));

  useEffect(() => {
    callGetNYTBookRecommendationsEndpoint();
  }, []);

  useEffect(() => {
    if (responseCode !== 0 && responseCode !== 401 && response && response.length > 0) {
      setNytRecData([...response.filter((rec) => lists.includes(rec.list_name_encoded))]);
    }
  }, [responseCode, response]);

  const carousels = lists.map((list, index) => {
    const listData = nytRecData.find((rec) => rec.list_name_encoded === list);
    const books = listData ? listData.books : [];
    return (
      <Fragment key={`${list}-fragment`}>
        <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
        <Typography variant="h4">{listDisplayNames[index]}</Typography>
        <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
        { books.length ? (
          <StyledCarousel sx={{ width: '100%' }}>
            {books.map((book) => (
              <BookCard
                key={list + book.book_id}
                link={`/book/${book.book_id}`}
                title={book.title}
                author={book.authors}
                img={book.image_link === 'No image available' ? null : book.image_link}
                year={new Date(book.publication_date).getFullYear()}
                avgRating={book.average_rating === 'No rating available' ? 0 : book.average_rating}
              />
            ))}
          </StyledCarousel>
        ) : (
          <CircularProgress sx={{ margin: '0 auto' }} />
        )}
      </Fragment>
    );
  });

  return carousels;
}

export default NYTBookRecommendations;
