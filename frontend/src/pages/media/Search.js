import { useState } from 'react';
import useSearchStore from '../../stores/SearchStore';
import { post } from '../../api';
import useApi from '../../hooks/api';

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

  const handleAddShow = (remoteServerId) => {
    post('show/', { remote_server_id: remoteServerId })
      .then(data => {
        console.log('Show added successfully: ', JSON.stringify(data));
      })
      .catch(error => {
        console.error('Error adding show:', error);
      });
  };

  return (
    <div>
      <h1>Search</h1>
      <input type="text" value={query} onChange={handleInputChange} placeholder="Search..." />
      <button onClick={handleClear}>Clear</button>
      {isLoading && <p>Loading...</p>}
      <div>
        {results.map((result) => (
          <div key={result.id} className="show-detail">
            <div className='show-detail-header'>
              <div className='show-poster'>
                {result.image && <img src={result.image} alt='show-poster' />}
              </div>
              <div className='show-description'>
                <h2>{result.name}</h2>
                <span className='smaller'>ID: {result.id}</span>
                <p dangerouslySetInnerHTML={{__html: result.summary}} />
                <div className='tag-group'>
                  <a href={result.url} target='_blank' rel='noreferrer'>Link</a>
                  <span>Status: {result.status}</span>
                  {result.premiered && <span>Premiered: {result.premiered}</span>}
                  {result.ended && <span>Ended: {result.ended}</span>}
                  <button className='pointer' onClick={() => handleAddShow(result.id)}>Add</button>
                </div>
                {result.genres.length > 0 && <p>Genres: {result.genres.join(', ')}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
