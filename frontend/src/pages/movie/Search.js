import { useState } from 'react';
import useApi from "../../hooks/api"
import useMovieSearchStore from "../../stores/MovieSearchStore";
import MovieSearchResult from '../../components/MovieSearchResult';

const MovieSearch = () => {
  const { get } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(null);
  const { query, results, setQuery, setResults } = useMovieSearchStore();

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
        get(`movie/remote-search?q=${encodeURIComponent(newQuery)}`)
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
      <h1>Search Movies</h1>
      <input type="text" value={query} onChange={handleInputChange} placeholder="Search..." />
      <button onClick={handleClear}>Clear</button>
      {isLoading ? (
        <p>Loading...</p>
      ) : results?.length > 0 ? (
        results.map((result) => (
          <MovieSearchResult key={result.id} result={result} />
        ))
      ) : (
        <p>Search query did not return any results.</p>
      )}
    </div>
  )
}

export default MovieSearch
