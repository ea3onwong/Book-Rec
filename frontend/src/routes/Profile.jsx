import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Cookies from 'js-cookie';
import { React, useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import StyledCarousel from '../components/StyledCarousel';
import BookCard from '../components/cards/BookCard';
import CollectionCard from '../components/cards/CollectionCard';
import ProfileReviewCard from '../components/cards/ProfileReviewCard';
import SetReadingGoalsDialogButton from '../components/dialogs/SetReadingGoalsDialogButton';
import SearchAppBar from '../components/sections/SearchAppBar';
import fetchEndpoint from '../fetchEndpoint';
import useEndpoint from '../hooks/useEndpoint';
import useEndpointN from '../hooks/useEndpointN';

function Profile() {
  const jwt = useLoaderData();
  // eslint-disable-next-line no-underscore-dangle
  const userId = jwt?._id ? jwt._id : '';

  const { id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get('token');
  const isOwnProfile = id === userId;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isModerator, setIsModerator] = useState(false);
  const [collections, setCollections] = useState([]);
  const [mainCollection, setMainCollection] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookData, setBookData] = useState({});
  const [numRead, setNumRead] = useState(0);
  const [readGoalData, setReadGoalData] = useState({});
  const [recentlyAdded, setRecentlyAdded] = useState([]);

  const reviewCount = reviews?.filter((review) => review.review_text).length || 0;

  const [profileResponseCode, profileResponse, callProfileEndpoint] = useEndpoint([], () => (
    fetchEndpoint(`/user/profile?userid=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`, { method: 'GET' })));

  const [reviewsResponseCode, reviewsResponse, callReviewsEndpoint] = useEndpoint([], () => (
    fetchEndpoint(`/review/get_user?user_id=${encodeURIComponent(id)}`, { method: 'GET' })));

  const [numReadResponseCode, numReadResponse, callNumReadEndpoint] = useEndpoint([], () => (
    fetchEndpoint(`/book/get_num_books_read?user_id=${encodeURIComponent(id)}`, { method: 'GET' })));

  const [bookResponseCodes, bookResponses, callBookEndpoint] = useEndpointN([], (bookId) => (
    fetchEndpoint(`/book/get_data?bookid=${encodeURIComponent(bookId)}`, { method: 'GET' })));

  useEffect(() => {
    callProfileEndpoint();
    callReviewsEndpoint();
    callNumReadEndpoint();
  }, []);

  useEffect(() => {
    if (profileResponseCode === 200) {
      setMainCollection(profileResponse.main_collection);
      setCollections(profileResponse.collection_list ? profileResponse.collection_list : []);
      setFirstName(profileResponse.first_name || '');
      setLastName(profileResponse.last_name || '');
      setBio(profileResponse.bio || '');
      setUsername(profileResponse.username || '');
      setRecentlyAdded(profileResponse.recently_added ? profileResponse.recently_added : []);
      setReadGoalData(profileResponse.reading_goal);
      setIsModerator(profileResponse.moderator);
      document.title = `${profileResponse.first_name} ${profileResponse.last_name} - BookRec`;
    } else if (profileResponseCode === 400 && profileResponse.message === 'Invalid token') {
      navigate('/logout-invalid');
    } else if (profileResponseCode === 400) {
      navigate('/404');
    }
  }, [profileResponseCode, profileResponse]);

  useEffect(() => {
    if (reviewsResponseCode === 200) {
      setReviews(reviewsResponse);
      reviewsResponse.forEach((review) => {
        callBookEndpoint(review.book_id);
      });
    }
  }, [reviewsResponseCode, reviewsResponse]);

  useEffect(() => {
    const newBookData = {};
    bookResponses.forEach((bookResponse, i) => {
      if (bookResponseCodes[i] === 200) {
        newBookData[bookResponse.book_id] = bookResponse;
      }
    });
    setBookData((prev) => ({ ...prev, ...newBookData }));
  }, [bookResponseCodes, bookResponses]);

  useEffect(() => {
    if (numReadResponseCode === 200) {
      setNumRead(numReadResponse || 0);
    }
  }, [numReadResponseCode, numReadResponse]);

  const recentlyAddedCards = recentlyAdded.map((book) => (
    <BookCard
      // eslint-disable-next-line no-underscore-dangle
      key={book.book_id}
      img={book.image_link === 'No image available' ? null : book.image_link}
      alt={book.title}
      title={book.title}
      author={book.authors}
      year={new Date(book.publication_date).getFullYear()}
      avgRating={book.average_rating === 'No rating available' ? 0 : book.average_rating}
      // eslint-disable-next-line no-underscore-dangle
      link={`/book/${book.book_id}`}
      addedDate={new Date(book.date_added)?.toDateString()}
    />
  ));

  const reviewCards = reviews.map((review) => {
    const book = bookData[review.book_id];
    return book ? (
      <ProfileReviewCard
        // eslint-disable-next-line no-underscore-dangle
        key={review._id}
        img={book.image_link === 'No image available' ? null : book.image_link}
        reviewText={review.review_text}
        year={new Date(book.publication_date).getFullYear()}
        title={book.title}
        author={book.authors}
        rating={review.rating}
        ratingIncluded={review.rating_included}
        reviewDate={review.review_date}
        link={`/book/${review.book_id}`}
      />
    ) : null;
  });

  const collectionCards = collections.map((collection, i) => (
    <CollectionCard
      key={collection.name}
      title={collection.name}
      description={collection.description}
      bookCount={collection.book_list?.length}
      link={`/profile/${id}/collection/${i}`}
      image={collection.book_list?.length > 0 && collection.book_list.find((book) => book?.image_link !== 'No image available')?.image_link}
    />
  ));

  const nothingHere = (
    <Typography variant="subtitle1">Nothing here...</Typography>
  );

  return (
    <div className="App">
      <header className="App-header">
        <SearchAppBar />
      </header>
      {(profileResponseCode === 0 || numReadResponseCode === 0 || reviewsResponseCode === 0) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
          <CircularProgress sx={{ margin: '0 auto' }} />
        </Box>
      ) : (
        <>
          <Box sx={{
            display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '0 5vw', margin: '5vh',
          }}
          >
            <AccountCircleOutlinedIcon sx={{ width: '128px', height: '128px' }} />
            <Box sx={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start',
            }}
            >
              <Typography variant="h4">
                {`${firstName} ${lastName}`}
                { isModerator && (
                  <Tooltip title="Moderator">
                    <LocalPoliceIcon sx={{ margin: '0 0.5rem' }} />
                  </Tooltip>
                )}
              </Typography>
              <Typography variant="subtitle1">
                {`@${username}`}
              </Typography>
              <Typography variant="body1" sx={{ margin: '5% 0 0 0' }}>
                {bio}
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'start', gap: '0 10%',
            }}
            >
              <Box sx={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              }}
              >
                <Typography variant="body1">{numRead}</Typography>
                <Typography variant="subtitle1">books</Typography>
              </Box>
              <Box sx={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              }}
              >
                <Typography variant="body1">{collections.length + 1}</Typography>
                <Typography variant="subtitle1">collections</Typography>
              </Box>
              <Box sx={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              }}
              >
                <Typography variant="body1">{reviewCount}</Typography>
                <Typography variant="subtitle1">reviews</Typography>
              </Box>
            </Box>
            <Box sx={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.5rem 0',
            }}
            >
              {readGoalData?.num_books && (
                <Typography variant="subtitle1">
                  {`Read ${readGoalData.books_read} / ${readGoalData.num_books} books this ${readGoalData.timeframe}.`}
                </Typography>
              )}
              {readGoalData?.achieve_date && (
                <Typography variant="subtitle1">
                  {`Achieved on ${new Date(readGoalData.achieve_date)?.toDateString()}.`}
                </Typography>
              )}
              { isOwnProfile && <SetReadingGoalsDialogButton /> }
            </Box>
          </Box>
          <Box sx={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', margin: '5vh 10vw', gap: '1rem 0',
          }}
          >
            <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
            <Box sx={{
              display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%',
            }}
            >
              <Typography variant="h4">Recently Added Books</Typography>
            </Box>
            <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
            {recentlyAddedCards.length > 0 ? (
              <StyledCarousel sx={{ width: '100%' }}>
                {recentlyAddedCards}
              </StyledCarousel>
            ) : nothingHere}
            <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
            <Typography variant="h4">Recently Rated and Reviewed</Typography>
            <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
            {reviewCards?.length > 0 ? (
              <StyledCarousel sx={{ width: '100%' }}>
                {reviewCards}
              </StyledCarousel>
            ) : nothingHere}
            <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
            <Typography variant="h4">Collections</Typography>
            <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
            <StyledCarousel sx={{ width: '100%' }}>
              {([<CollectionCard
                key="main"
                title="Read"
                description="Books you've read"
                link={`/profile/${id}/collection-main`}
                image={mainCollection?.length && mainCollection?.find((book) => book?.image_link !== 'No image available')?.image_link}
              />].concat(collectionCards))}
            </StyledCarousel>
          </Box>
        </>
      )}
    </div>
  );
}

export default Profile;
