import { useEffect, useState } from 'react'
import useApi from '../hooks/api'
import TimeComponent from './TimeComponent'
import { formatBytes } from '../utils'
import { Button, H2, Input, P, TagItem } from './Typography'
import Spinner from './Spinner'

export type ManualSearchType = {
  id: string
  title: string
  indexer: string
  size: number
  seeders: number
  leechers: number
  gain: number
  publishDate: string
}

interface ManualSearchInterface {
  searchType: string
  searchTypeId: number
  searchDefault: string
  setRefresh?: (toRefresh: boolean) => void
}

interface ManualSearchResultInterface {
  result: ManualSearchType
  searchType: string
  searchTypeId: number
  setRefresh?: (toRefresh: boolean) => void
}

const ManualSearchResult: React.FC<ManualSearchResultInterface> = ({
  result,
  searchType,
  searchTypeId,
  setRefresh,
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
    if (setRefresh) setRefresh(true)
  }

  return (
    <div key={result.id} className="border border-accent-1 mb-2 p-2">
      <P>{result.title}</P>
      <div className="flex gap-2 my-2">
        <TagItem>{result.indexer}</TagItem>
        <TagItem>{formatBytes(result.size)}</TagItem>
        <TagItem>
          Published: <TimeComponent timestamp={result.publishDate} />
        </TagItem>
        <TagItem title="Seeders / Leechers / Gain">
          {result.seeders} / {result.leechers} / {result.gain}
        </TagItem>
      </div>
      {addDownloadLoading === null && (
        <Button onClick={() => handleDownload(result.id)}>Download</Button>
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
  setRefresh,
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
      <H2>Manual Search for {searchType}</H2>
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
                  key={result.id}
                  result={result}
                  searchType={searchType}
                  searchTypeId={searchTypeId}
                  setRefresh={setRefresh}
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
