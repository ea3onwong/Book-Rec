import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Cookies from 'js-cookie';
import { React, useEffect, useState } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import BookCard from '../components/cards/BookCard';
import CollectionDeleteBookButton from '../components/forms/CollectionDeleteBookButton';
import SearchAppBar from '../components/sections/SearchAppBar';
import fetchEndpoint from '../fetchEndpoint';
import useEndpoint from '../hooks/useEndpoint';

/**
 * Renders a page for a collection, expects a name parameter in the url "/collection/:name".
 * If url is in format of "/profile/:id/collection/:name", renders the collection for the :id user.
 * If main is passed as a prop, renders the main collection.
 */
function Collection({ main }) {
  const { num, id } = useParams();
  const jwt = useLoaderData();
  // eslint-disable-next-line no-underscore-dangle
  const userId = jwt?._id ? jwt._id : '';
  const token = Cookies.get('token');

  const isOwnCollection = id === userId || !id;
  const fetchId = id || userId;
  const [collectionData, setCollectionData] = useState({});
  const [collectionsResponseCode, collectionsResponse, callGetCollectionsEndpoint] = (
    useEndpoint([401, 402], () => (
      fetchEndpoint(`/collections/get_collections?userid=${fetchId}&token=${encodeURIComponent(token)}`, { method: 'GET' }))));

  const [mainCollectionResponseCode, mainCollectionResponse, callGetMainCollectionEndpoint] = (
    useEndpoint([401, 402], () => (
      fetchEndpoint(`/collections/get_main?userid=${fetchId}&token=${encodeURIComponent(token)}`, { method: 'GET' }))));

  useEffect(() => {
    if (userId && (num || num === 0) && !main) {
      callGetCollectionsEndpoint();
    } else if (userId && main) {
      callGetMainCollectionEndpoint();
    }
  }, [userId]);

  useEffect(() => {
    if (collectionsResponseCode === 200) {
      const n = parseInt(num, 10);
      if (
        Number.isInteger(n)
        && n >= 0
        && n < collectionsResponse.length
        && collectionsResponse
        && collectionsResponse.length > 0
      ) {
        const collection = collectionsResponse[num];
        setCollectionData(collection || {});
        document.title = `${collection.name} - BookRec`;
      }
    }
  }, [collectionsResponseCode, collectionsResponse]);

  useEffect(() => {
    if (mainCollectionResponseCode === 200) {
      setCollectionData(
        {
          name: 'Read',
          description: "Books you've read",
          book_list: mainCollectionResponse,
        },
      );
      document.title = 'Read - BookRec';
    }
  }, [mainCollectionResponseCode, mainCollectionResponse]);

  const title = collectionData.name || 'Unable to load collection';
  const description = collectionData.description || '';

  const bookCards = collectionData.book_list?.length ? collectionData.book_list?.map((book) => (
    <BookCard
      key={book.book_id}
      link={`/book/${book.book_id}`}
      title={book.title}
      author={book.authors}
      year={new Date(book.publication_date).getFullYear()}
      addedDate={new Date(book.date_added).toDateString()}
      img={book.image_link === 'No image available' ? undefined : book.image_link}
      adornment={
        isOwnCollection && !main
        && <CollectionDeleteBookButton collectionName={title} bookId={book.book_id} />
      }
    />
  )) : (<Typography variant="subtitle1"><i>No books in this collection</i></Typography>);

  return (
    <div className="App">
      <header className="App-header">
        <SearchAppBar />
      </header>
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', margin: '5vh 10vw', gap: '1rem 0',
      }}
      >
        <Box sx={{
          display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%',
        }}
        >
          { collectionsResponseCode !== 0 || mainCollectionResponseCode !== 0
            ? (<Typography variant="h4">{title}</Typography>)
            : (<CircularProgress sx={{ margin: '0 auto' }} />)}
        </Box>
        { collectionsResponseCode !== 0 || mainCollectionResponseCode !== 0
          ? (<Typography variant="subtitle1">{description}</Typography>)
          : (<CircularProgress sx={{ margin: '0 auto' }} />)}
        <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
        { collectionsResponseCode !== 0 || mainCollectionResponseCode !== 0
          ? bookCards
          : <CircularProgress sx={{ margin: '0 auto' }} />}
      </Box>
    </div>
  );
}

export default Collection;
