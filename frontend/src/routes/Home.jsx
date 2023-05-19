import Cookies from 'js-cookie';
import { React, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookRecommendations from '../components/sections/BookRecommendations';
import SearchAppBar from '../components/sections/SearchAppBar';

function Home() {
  const navigate = useNavigate();
  const token = Cookies.get('token');

  useEffect(() => {
    document.title = 'Home - BookRec';
    if (!token) {
      navigate('/');
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <SearchAppBar />
      </header>
      <BookRecommendations />
    </div>
  );
}

export default Home;
