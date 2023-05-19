import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Cookies from 'js-cookie';
import { React, useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import CollectionCard from '../components/cards/CollectionCard';
import CreateCollectionDialogButton from '../components/dialogs/CreateCollectionDialogButton';
import SearchAppBar from '../components/sections/SearchAppBar';
import fetchEndpoint from '../fetchEndpoint';
import useEndpoint from '../hooks/useEndpoint';

function Collections() {
  const jwt = useLoaderData();
  // eslint-disable-next-line no-underscore-dangle
  const userId = jwt?._id ? jwt._id : '';
  const token = Cookies.get('token');

  const [collections, setCollections] = useState([]);
  const [mainCollection, setMainCollection] = useState([]);

  const [collectionsResponseCode, collectionsResponse, callGetCollectionsEndpoint] = (
    useEndpoint([401, 402], () => (
      fetchEndpoint(`/collections/get_collections?userid=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`, { method: 'GET' }))));

  const [mainCollectionResponseCode, mainCollectionResponse, callGetMainCollectionEndpoint] = (
    useEndpoint([401, 402], () => (
      fetchEndpoint(`/collections/get_main?userid=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`, { method: 'GET' }))));

  useEffect(() => {
    if (userId) {
      callGetCollectionsEndpoint();
      callGetMainCollectionEndpoint();
    }
  }, [userId]);

  useEffect(() => {
    if (collectionsResponseCode === 200) {
      setCollections(collectionsResponse);
    }
  }, [collectionsResponseCode, collectionsResponse]);

  useEffect(() => {
    if (mainCollectionResponseCode === 200) {
      setMainCollection(mainCollectionResponse);
    }
  }, [mainCollectionResponseCode, mainCollectionResponse]);

  useEffect(() => {
    document.title = 'Collections - BookRec';
  }, []);

  const mainCard = userId ? (
    <CollectionCard
      title="Read"
      description="Books you've read"
      bookCount={mainCollection?.length}
      link="collection-main"
      image={mainCollection && mainCollection?.find((book) => book?.image_link !== 'No image available')?.image_link}
    />
  ) : null;

  const collectionCards = collections.map((collection, i) => (
    <CollectionCard
      key={collection.name}
      title={collection.name}
      description={collection.description}
      bookCount={collection.book_list?.length}
      image={collection.book_list?.length > 0 && collection.book_list.find((book) => book?.image_link !== 'No image available')?.image_link}
      link={`/collection/${i}`}
    />
  ));

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
          <Typography variant="h4">All Collections</Typography>
          {userId && <CreateCollectionDialogButton />}
        </Box>
        <Divider variant="middle" sx={{ borderBottomWidth: 2, width: '100%', margin: 0 }} />
        {collectionsResponseCode !== 0 && mainCollectionResponseCode !== 0 ? (
          <Box sx={{ width: '100%' }}>
            {mainCard}
            {collectionCards}
            {!userId && <Typography variant="subtitle1">Login to view your collections!</Typography>}
          </Box>
        ) : <CircularProgress sx={{ margin: '0 auto' }} />}
      </Box>
    </div>
  );
}

export default Collections;
