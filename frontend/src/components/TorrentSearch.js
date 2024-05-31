import { useEffect, useState } from "react"
import useApi from "../hooks/api";
import TimeComponent from "./TimeComponent";

const TorrentSearch = ({ searchDefault = '' }) => {

  const { post } = useApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const handleSearch = async () => {
    setIsSearching(true);
    const data = await post('torrent/search/', {search_term: searchTerm});
    if (data) {
      setSearchResults(data);
    } else {
      searchResults(null)
    }
    setIsSearching(false);
  }

  const handleClear = () => {
    setSearchResults(null);
  }

  useEffect(() => {
    setSearchTerm(searchDefault);
  }, [searchDefault]);

  return (
    <div className="manual-search">
      <h2>Manual Search</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      {searchResults !== null && <button onClick={handleClear}>Clear</button>}
      {isSearching ? (
        <span>Searching...</span>
      ) : searchResults !== null ? (
        searchResults.length > 0 ? (
          <>
            <p>{searchResults.length} results found</p>
            <div className="manual-search-results">
              {searchResults.map((result) => (
                <div key={result.Id} className="manual-search-item">
                  <p>{result.Title}</p>
                  <div className="tag-group">
                    <span className="tag-item">{result.Tracker}</span>
                    <span className="tag-item">{formatBytes(result.Size)}</span>
                    <span className="tag-item">Published: <TimeComponent timestamp={result.PublishDate} /></span>
                    <span className="tag-item" title="Seeders / Leechers / Gain">
                      {result.Seeders} / {result.Peers} / {result.Gain.toFixed(2)}
                    </span>
                  </div>
                  <button data-id={result.Id}>Download</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>No results found</p>
        )
      ) : null}
    </div>
  );
}

export default TorrentSearch;
