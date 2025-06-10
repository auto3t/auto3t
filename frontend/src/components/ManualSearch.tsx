import { useEffect, useState } from 'react'
import useApi from '../hooks/api'
import TimeComponent from './TimeComponent'
import { formatBytes } from '../utils'
import { Button, H2, Input, P, TagItem } from './Typography'
import Spinner from './Spinner'

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

interface ManualSearchResultInterface {
  result: ManualSearchType
  searchType: string
  searchTypeId: number
}

const ManualSearchResult: React.FC<ManualSearchResultInterface> = ({
  result,
  searchType,
  searchTypeId,
}) => {
  const { post, error } = useApi()
  const [addDownloadLoading, setAddDownloadLoading] = useState<null | boolean>(
    null,
  )

  const handleDownload = async (resultId: string) => {
    console.log(resultId)
    setAddDownloadLoading(true)
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
    setAddDownloadLoading(false)
  }

  return (
    <div key={result.Id} className="border border-accent-1 mb-2 p-2">
      <P>{result.Title}</P>
      <div className="flex gap-2 my-2">
        <TagItem>{result.Tracker}</TagItem>
        <TagItem>{formatBytes(result.Size)}</TagItem>
        <TagItem>
          Published: <TimeComponent timestamp={result.PublishDate} />
        </TagItem>
        <TagItem title="Seeders / Leechers / Gain">
          {result.Seeders} / {result.Peers} / {result.Gain.toFixed(2)}
        </TagItem>
      </div>
      {addDownloadLoading === null && (
        <Button onClick={() => handleDownload(result.Id)}>Download</Button>
      )}
      {addDownloadLoading === true && <P>Loading...</P>}
      {addDownloadLoading === false && !error && <P>Done</P>}
      {error && <P>Failed to add: {error}</P>}
    </div>
  )
}

const ManualSearch: React.FC<ManualSearchInterface> = ({
  searchType,
  searchTypeId,
  searchDefault = '',
}) => {
  const { post } = useApi()
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

  useEffect(() => {
    setSearchTerm(searchDefault)
  }, [searchDefault])

  return (
    <div className="manual-search">
      <H2>Manual Search</H2>
      <div className="flex gap-2">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
        {searchResults !== null && <Button onClick={handleClear}>Clear</Button>}
      </div>
      {isSearching ? (
        <Spinner />
      ) : searchResults !== null ? (
        searchResults.length > 0 ? (
          <>
            <P className="mb-2">{searchResults.length} results found</P>
            <div className="max-h-[50vh] overflow-scroll">
              {searchResults.map((result) => (
                <ManualSearchResult
                  key={result.Id}
                  result={result}
                  searchType={searchType}
                  searchTypeId={searchTypeId}
                />
              ))}
            </div>
          </>
        ) : (
          <P>No results found</P>
        )
      ) : null}
    </div>
  )
}

export default ManualSearch
