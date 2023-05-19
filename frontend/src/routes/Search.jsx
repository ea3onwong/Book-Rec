import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import { React, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../components/cards/BookCard';
import UserCard from '../components/cards/UserCard';
import SearchAppBar from '../components/sections/SearchAppBar';
import fetchEndpoint from '../fetchEndpoint';
import useEndpoint from '../hooks/useEndpoint';
import useEndpointN from '../hooks/useEndpointN';

function Search() {
  const { searchParams } = new URL(window.location.href);
  const query = searchParams.get('query');
  const [pageNum, setPageNum] = useState(0);
  const [bookData, setBookData] = useState({});
  const RESULTS_PER_PAGE = 40;
  const [loading, setLoading] = useState(true);

  // whether or not there are more results to load
  const [bookResultsDepleted, setBookResultsDepleted] = useState(false);
  const [userResultsDepleted, setUserResultsDepleted] = useState(false);
  const resultsDepleted = { books: bookResultsDepleted, users: userResultsDepleted };
  const setResultsDepleted = { books: setBookResultsDepleted, users: setUserResultsDepleted };

  const [searchType, setSearchType] = useState(searchParams.get('type') || 'books');
  const [searchBookResults, setSearchBookResults] = useState([]);
  const [searchUserResults, setSearchUserResults] = useState([]);
  const results = { books: searchBookResults, users: searchUserResults };
  const setResults = { books: setSearchBookResults, users: setSearchUserResults };
  const resultId = { books: 'book_id', users: '_id' };
  const noResults = results[searchType].length === 0 && !loading;
  // keep track of which page number was processed last to know if results have been depleted
  // or react is just being annoying and sending the same page number twice
  let prevPageNum = 0;
  const [, setSearchParams] = useSearchParams();
  const [searchFetch, setSearchFetch] = useState(() => (() => (
    fetchEndpoint(`/search/${searchType}?query=${encodeURIComponent(query)}&startIndex=${encodeURIComponent(pageNum * RESULTS_PER_PAGE)}`))));

  const [responseCode, response, callSearchEndpoint] = useEndpoint([], searchFetch);

  const [
    , , callNumReadBookEndpoint,
  ] = useEndpointN([], (bookId) => (
    fetchEndpoint(`/book/get_num_readers?book_id=${encodeURIComponent(bookId)}`, { method: 'GET' })));

  const updateFetchParams = (customPageNum) => {
    setSearchFetch(() => (() => (
      fetchEndpoint(`/search/${searchType}?query=${encodeURIComponent(query)}&startIndex=${customPageNum * RESULTS_PER_PAGE}`))));
  };

  useEffect(() => {
    setSearchParams({ query, type: searchType });
    // Only update fetch params (which loads results) if there are no results for the current query
    if (results[searchType].length === 0) {
      updateFetchParams(0);
    }

    document.title = `"${query}" - BookRec`;
  }, [searchType, query]);

  useEffect(() => {
    if (responseCode === 200) {
      // need to verify the searchType because it isnt accurate i guess bc of async etc etc...
      let responseSearchType = response[0]?.book_id ? 'books' : 'users';
      if (response.length === 0) responseSearchType = searchType;

      const resultIdProp = resultId[responseSearchType];
      const prevResults = results[responseSearchType];
      const newResults = [...prevResults, ...response];

      const uniqueResults = newResults.filter((result, index) => (
        result[resultIdProp]
        && newResults.findIndex((x) => x[resultIdProp] === result[resultIdProp]) === index));

      setResults[responseSearchType](uniqueResults);

      // no new unique results added AND the current fetch is a new page number
      if (uniqueResults.length <= prevResults.length && pageNum !== prevPageNum) {
        setResultsDepleted[responseSearchType](true);
      } else {
        // sometimes old results come in after pagenum changes, so it thinks results are depleted
        // so make sure to set back to false when actual page's results come in
        setResultsDepleted[responseSearchType](false);
      }

      prevPageNum = pageNum;

      // fetch book data for each book to get num readers
      if (responseSearchType === 'books') {
        response.filter((book) => !bookData[book.book_id]).forEach((book) => {
          callNumReadBookEndpoint(book.book_id, (res, status) => {
            if (status === 200) {
              setBookData((prevBookData) => ({ ...prevBookData, [book.book_id]: res }));
            }
          });
        });
      }
    }
    setLoading(false);
  }, [response]);

  useEffect(() => {
    callSearchEndpoint();
    setLoading(true);
  }, [searchFetch]);

  const loadNextPage = () => {
    // update the fetch functions pageNum manually bc setPageNum is async
    // so it wont register fast enough
    updateFetchParams(pageNum + 1);
    setPageNum(pageNum + 1);
  };

  const bookCards = searchBookResults.map((book) => (
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
      numReaders={bookData[book.book_id] ? bookData[book.book_id] : 0}
    />
  ));

  const userCards = searchUserResults.map((user) => (
    <UserCard
      /* eslint-disable no-underscore-dangle */
      key={user._id}
      userId={user._id}
      link={`/profile/${user._id}`}
      /* eslint-enable no-underscore-dangle */
      username={user.username}
      firstName={user.first_name}
      lastName={user.last_name}
    />
  ));

  return (
    <div className="App">
      <header className="App-header">
        <SearchAppBar />
      </header>
      <Box sx={{
        display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'start',
      }}
      >
        <Box sx={{
          width: '80%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', margin: '5vh 10vw', gap: '1rem 0',
        }}
        >
          <Box sx={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          }}
          >
            <Typography variant="h6">
              Search Results for &quot;
              {query}
              &quot;
            </Typography>
          </Box>
          <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
          {bookCards.length > 0 && searchType === 'books' && bookCards}
          {userCards.length > 0 && searchType === 'users' && userCards}
          {noResults && 'No results found.'}
          {loading && (
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          )}
          {!loading && !resultsDepleted[searchType] && !noResults && (
            <Box sx={{
              display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%',
            }}
            >
              <Button variant="contained" sx={{ width: 'fit-content', color: '#fff' }} onClick={loadNextPage}>
                Load More
              </Button>
            </Box>
          )}
        </Box>
        <Box sx={{ width: '20%', margin: '3rem 0' }}>
          <FormControl>
            <FormLabel id="search-radio">Show Results For</FormLabel>
            <RadioGroup
              defaultValue="books"
              name="radio-buttons-group"
              onChange={(event) => setSearchType(event.target.value)}
              value={searchType}
            >
              <FormControlLabel value="books" control={<Radio />} label="Books" />
              <FormControlLabel value="users" control={<Radio />} label="Users" />
            </RadioGroup>
          </FormControl>
        </Box>
      </Box>
    </div>
  );
}

export default Search;
