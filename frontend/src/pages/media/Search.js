import React, { useState } from 'react';
import useSearchStore from '../../stores/SearchStore';

const Search = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(null);
  const { query, results, setQuery, setResults } = useSearchStore();

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (timer) {
      clearTimeout(timer);
    }

    if (newQuery.length >= 2) {
      setIsLoading(true);
      // Set a new timer for search
      const newTimer = setTimeout(() => {
        fetch(`http://localhost:8000/api/remote-search?q=${encodeURIComponent(newQuery)}`)
          .then((response) => response.json())
          .then((data) => {
            setResults(data);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error('Error fetching search results:', error);
            setIsLoading(false);
          });
      }, 500);
      setTimer(newTimer);
    } else {
      setResults([]);
    }
  };

  return (
    <div>
      <h1>Search</h1>
      <input type="text" value={query} onChange={handleInputChange} placeholder="Search..." />
      {isLoading && <p>Loading...</p>}
      <div>
        {results.map((result) => (
          <div key={result.id} className='search-result'>
            <div className='search-poster'>
              <img src={result.image} alt='image-poster' />
            </div>
            <div className='search-description'>
              <h2>{result.name}</h2>
              <p dangerouslySetInnerHTML={{__html: result.summary}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
