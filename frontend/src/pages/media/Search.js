import { useState } from 'react';
import useSearchStore from '../../stores/SearchStore';
import useApi from '../../hooks/api';
import ShowSearchResult from '../../components/ShowSearchResult';

const Search = () => {
  const { get } = useApi();
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
        get(`remote-search?q=${encodeURIComponent(newQuery)}`)
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

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div>
      <h1>Search</h1>
      <input type="text" value={query} onChange={handleInputChange} placeholder="Search..." />
      <button onClick={handleClear}>Clear</button>
      {isLoading ? (
        <p>Loading...</p>
      ) : results?.length > 0 ? (
        results.map((result) => (
          <ShowSearchResult key={result.id} result={result} />
        ))
      ) : (
        <p>Search query did not return any results.</p>
      )}
    </div>
  );
};

export default Search;
