import { useEffect, useState } from "react"
import useApi from "../hooks/api";

const TorrentSearch = ({ searchDefault = '' }) => {

  const { post } = useApi();
  const [searchTerm, setSearchTerm] = useState(searchDefault);
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

  const buildDownloadButton = (result) => {
    const linkType = result.MagnetUri  !== null ? 'Magnet' : 'Link';
    const url = result.MagnetUri !== null ? result.MagnetUri : result.Link
    return (<button data-url={url}>Download {linkType}</button>)
  }

  return (
    <div>
      <h2>Manual Search</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      {searchResults && (<button onClick={handleClear}>Clear</button>)}
      {isSearching ? (
        <span>Searching...</span>
      ) : searchResults && searchResults.length > 0 ? (
        <>
          <p>{searchResults.length} results found</p>
          <div className="manual-search-results">
            {searchResults.map((result, idx) => (
              <div key={idx} className="manual-search-item">
                <p>{result.Title}</p>
                <div className="tag-group">
                  <span className="tag-item">{result.Tracker}</span>
                  <span className="tag-item">{formatBytes(result.Size)}</span>
                  <span className="tag-item" title="Seeders / Leechers / Gain">
                    {result.Seeders} / {result.Peers} / {result.Gain.toFixed(2)}
                  </span>
                </div>
                {buildDownloadButton(result)}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
}

export default TorrentSearch;
