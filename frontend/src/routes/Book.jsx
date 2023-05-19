import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Cookies from 'js-cookie';
import { React, useEffect, useState } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import BookPageDetails from '../components/sections/BookPageDetails';
import BookPageHeader from '../components/sections/BookPageHeader';
import ReviewSection from '../components/sections/ReviewSection';
import SearchAppBar from '../components/sections/SearchAppBar';
import fetchEndpoint from '../fetchEndpoint';
import useEndpoint from '../hooks/useEndpoint';

/**
 * Renders a page for a book, expects an id parameter in the url "/book/:id".
 */
function Book() {
  const { id } = useParams();
  const jwt = useLoaderData();

  // eslint-disable-next-line no-underscore-dangle
  const userId = jwt?._id ? jwt._id : '';
  const token = Cookies.get('token');

  const [title, setTitle] = useState('Unable to load book');
  const [author, setAuthor] = useState('Unable to load author');
  const [avgRating, setAvgRating] = useState(0);
  const [numRatings, setNumRatings] = useState(0);
  const [numReaders, setNumReaders] = useState(0);
  const [description, setDescription] = useState('');
  const [isbn, setISBN] = useState('');
  const [publicationDate, setPublicationDate] = useState(null);
  const [publisher, setPublisher] = useState('');
  const [categories, setCategories] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [reviewData, setReviewData] = useState([]);
  const [nytData, setNYTData] = useState([]);
  // img licensed from Conung under cc-3.0 https://commons.wikimedia.org/wiki/File:No-Book.jpg
  const [img, setImg] = useState('https://upload.wikimedia.org/wikipedia/commons/6/67/No-Book.jpg');
  const [collectionNames, setCollectionNames] = useState([]);

  const [bookDataResponseCode, bookDataResponse, callBookDataEndpoint] = useEndpoint([], () => (
    fetchEndpoint(`/book/get_data?bookid=${encodeURIComponent(id)}`, { method: 'GET' })));

  const [
    ratingDataResponseCode, ratingDataResponse, callRatingDataEndpoint,
  ] = useEndpoint([], () => (fetchEndpoint(`/review/get_book_short?book_id=${encodeURIComponent(id)}`, { method: 'GET' })));

  const [collectionsResponseCode, collectionsResponse, callGetCollectionsEndpoint] = (
    useEndpoint([401, 402], () => (
      fetchEndpoint(`/collections/get_collections?userid=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`, { method: 'GET' }))));

  const [numReadersResponseCode, numReadersResponse, callGetNumReadersEndpoint] = (
    useEndpoint([], () => (
      fetchEndpoint(`/book/get_num_readers?book_id=${encodeURIComponent(id)}`, { method: 'GET' }))));

  const [nytResponseCode, nytResponse, callNYTEndpoint] = (
    useEndpoint([], () => (
      fetchEndpoint(`/nyt/get_data?book_id=${encodeURIComponent(id)}`, { method: 'GET' }))));

  const [reviewsResponseCode, reviewsResponse, callReviewsEndpoint] = useEndpoint([], () => (
    fetchEndpoint(`/review/get_book_full?book_id=${encodeURIComponent(id)}`, { method: 'GET' })));

  useEffect(() => {
    callBookDataEndpoint();
    callRatingDataEndpoint();
    callGetNumReadersEndpoint();
    callNYTEndpoint();
    callReviewsEndpoint();
  }, []);

  useEffect(() => {
    if (userId) {
      callGetCollectionsEndpoint();
    }
  }, [userId]);

  useEffect(() => {
    if (bookDataResponseCode === 200) {
      setTitle(bookDataResponse.title);
      setAuthor(bookDataResponse.authors);
      setDescription(bookDataResponse.summary);
      if (bookDataResponse.image_link !== 'No image available') {
        setImg(bookDataResponse.image_link);
      }
      setPublicationDate(bookDataResponse.publication_date);
      setPublisher(bookDataResponse.publisher);
      setCategories(bookDataResponse.categories);
      setIsFree(bookDataResponse.is_free);
      setISBN(bookDataResponse.isbn);
      document.title = `${bookDataResponse.title} - BookRec`;
    }
  }, [bookDataResponseCode, bookDataResponse]);

  useEffect(() => {
    if (numReadersResponseCode === 200) {
      const parsedNum = parseInt(numReadersResponse, 10);
      setNumReaders(Number.isNaN(parsedNum) ? 0 : parsedNum);
    }
  }, [numReadersResponseCode, numReadersResponse]);

  useEffect(() => {
    if (ratingDataResponseCode === 200) {
      setNumRatings(ratingDataResponse.number_of_reviews);
      setAvgRating(parseFloat(ratingDataResponse.average_rating));
    }
  }, [ratingDataResponseCode, ratingDataResponse]);

  useEffect(() => {
    if (collectionsResponseCode === 200) {
      setCollectionNames(collectionsResponse.map((collection) => collection.name));
    }
  }, [collectionsResponseCode, collectionsResponse]);

  useEffect(() => {
    if (reviewsResponseCode === 200) {
      setReviewData([...reviewsResponse]);
    }
  }, [reviewsResponseCode, reviewsResponse]);

  const hasReview = reviewData.some((review) => review.user_id === userId);

  useEffect(() => {
    if (nytResponseCode === 200) {
      setNYTData(nytResponse);
    }
  }, [nytResponseCode, nytResponse]);

  return (
    <div className="App">
      <header className="App-header">
        <SearchAppBar />
      </header>
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', margin: '5vh 10vw', gap: '1rem 0',
      }}
      >
        { bookDataResponseCode !== 0 ? (
          <BookPageHeader
            img={img}
            title={title}
            author={author}
            avgRating={avgRating}
            numRatings={numRatings}
            description={description}
            bookId={id}
            collectionNames={collectionNames}
            isFree={isFree}
            hasReview={hasReview}
          />
        ) : <CircularProgress sx={{ margin: '0 auto' }} />}
        <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
        {nytResponseCode !== 0 && bookDataResponseCode !== 0 ? (
          <BookPageDetails
            publisher={publisher}
            publicationDate={publicationDate}
            categories={categories}
            rankingData={(nytData && nytData.length) ? nytData : null}
            isbn={isbn}
          />
        ) : <CircularProgress sx={{ margin: '0 auto' }} />}
        <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
        {reviewsResponseCode !== 0 ? (
          <ReviewSection numReaders={numReaders} reviewData={reviewData} />
        ) : <CircularProgress sx={{ margin: '0 auto' }} />}
      </Box>
    </div>
  );
}

export default Book;
