import { useEffect, useState } from 'react'
import useApi from '../hooks/api'
import TimeComponent from './TimeComponent'
import { formatBytes } from '../utils'

export type ManualSearchType = {
  Id: string
  Title: string
  Tracker: string
  Size: number
  Seeders: number
  Peers: number
  Gain: number
  PublishDate: string
}

interface ManualSearchInterface {
  searchType: string
  searchTypeId: number
  searchDefault: string
}

const ManualSearch: React.FC<ManualSearchInterface> = ({
  searchType,
  searchTypeId,
  searchDefault = '',
}) => {
  const { post, error } = useApi()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ManualSearchType[] | null>(
    null,
  )

  const handleSearch = async () => {
    setIsSearching(true)
    setSearchResults(null)
    const data = await post('torrent/search/', {
      search_term: searchTerm,
      category: searchType,
    })
    if (data) {
      setSearchResults(data)
    } else {
      setSearchResults(null)
    }
    setIsSearching(false)
  }

  const handleClear = () => {
    setSearchResults(null)
  }

  const handleDownload = async (resultId: string) => {
    console.log(resultId)
    let searchCategory = null
    if (searchType == 'movie') {
      searchCategory = 'movie'
    } else {
      searchCategory = 'tv'
    }
    try {
      const data = await post(
        `${searchCategory}/${searchType}/${searchTypeId}/torrent/`,
        {
          search_id: resultId,
        },
      )
      console.log(data)
    } catch (error) {
      console.error('failed to add torrent', error)
    }
  }

  useEffect(() => {
    setSearchTerm(searchDefault)
  }, [searchDefault])

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
                    <span className="tag-item">
                      Published:{' '}
                      <TimeComponent timestamp={result.PublishDate} />
                    </span>
                    <span
                      className="tag-item"
                      title="Seeders / Leechers / Gain"
                    >
                      {result.Seeders} / {result.Peers} /{' '}
                      {result.Gain.toFixed(2)}
                    </span>
                  </div>
                  <button onClick={() => handleDownload(result.Id)}>
                    Download
                  </button>
                  {error && <span>Failed to add: {error}</span>}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>No results found</p>
        )
      ) : null}
    </div>
  )
}

export default ManualSearch
