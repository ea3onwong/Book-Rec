import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import Cookies from 'js-cookie';
import { React, useEffect, useState } from 'react';
import SearchAppBar from '../components/sections/SearchAppBar';
import fetchEndpoint from '../fetchEndpoint';
import useEndpoint from '../hooks/useEndpoint';

function AvgRatingCell({ avgRating }) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'row', gap: '0 0.3rem',
    }}
    >
      <Typography>{avgRating?.toFixed(2) || '0.0'}</Typography>
      <Rating value={avgRating || 0} readOnly />
    </Box>
  );
}

function Books() {
  const token = Cookies.get('token');
  const [recData, setRecData] = useState([]);
  const [responseCode, response, callGetRecsEndpoint] = (
    useEndpoint([], () => (
      fetchEndpoint(`/rec/?token=${token}`, { method: 'GET' }))));

  useEffect(() => {
    callGetRecsEndpoint();
    document.title = 'Books - BookRec';
  }, []);

  useEffect(() => {
    if (responseCode === 200 && response && response.rec) {
      setRecData([...response.rec]);
    }
  }, [responseCode, response]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'image_link',
      headerName: 'Cover',
      width: '150',
      flex: 1,
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Link href={`/book/${params.row.id}`}>
          <img src={params.row.image_link} alt="Book cover" />
        </Link>
      ),
    },
    {
      field: 'title',
      headerName: 'Title',
      headerAlign: 'center',
      filterable: false,
      align: 'center',
      width: '200',
      flex: 1, // fill remaining space so no deadspace
    },
    {
      field: 'author',
      headerName: 'Author',
      headerAlign: 'center',
      align: 'center',
      width: '150',
      flex: 1,
    },
    {
      field: 'year',
      headerName: 'Year',
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      width: '100',
      flex: 1,
      sortable: true,
      renderCell: (params) => (params.row.year),
    },
    {
      field: 'categories',
      headerName: 'Categories',
      headerAlign: 'center',
      align: 'center',
      width: '140',
      flex: 1,
      sortable: true,
    },
    {
      field: 'avgRating',
      headerName: 'Average Rating',
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      width: '128',
      flex: 1,
      sortable: true,
      renderCell: (params) => (<AvgRatingCell avgRating={params.row.avgRating} />),
    },
    {
      field: 'isFree',
      headerName: 'Free to Read',
      headerAlign: 'center',
      align: 'center',
      type: 'boolean',
      width: '128',
      flex: 1,
      sortable: true,
      renderCell: (params) => (params.row.isFree ? <CheckIcon sx={{ color: 'green' }} /> : <CloseIcon sx={{ color: 'red' }} />),
    },
  ];

  const rows = recData.map((book) => ({
    id: book.book_id,
    image_link: book.image_link === 'No image available' ? null : book.image_link,
    title: book.title,
    year: new Date(book.publication_date)?.getFullYear() || null,
    author: book.authors,
    avgRating: book.average_rating === 'No rating available' ? 0 : book.average_rating,
    isFree: book.is_free,
    categories: book.categories,
  }));

  return (
    <div className="App">
      <header className="App-header">
        <SearchAppBar />
      </header>
      <Box sx={{
        width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexDirection: 'column',
      }}
      >
        <Typography variant="h4" sx={{ padding: '1rem' }} align="center">Recommended Books</Typography>
        {responseCode === 0 ? (
          <CircularProgress sx={{ margin: '0 auto' }} />
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            getRowHeight={() => 'auto'}
            columnVisibilityModel={{
              id: false,
            }}
            pageSizeOptions={[10]}
            disableRowSelectionOnClick
          />
        )}
      </Box>
    </div>
  );
}

export default Books;
