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
      <h2>Search</h2>
      <input type="text" value={query} onChange={handleInputChange} placeholder="Search..." />
      {isLoading && <p>Loading...</p>}
      <ul>
        {results.map((result) => (
          <li key={result.id}>
            <a href={result.url}>{result.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
