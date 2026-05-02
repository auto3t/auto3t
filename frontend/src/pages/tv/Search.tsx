import { useCallback, useEffect, useState } from 'react'
import useApi from '../../hooks/api'
import ShowSearchResult from '../../components/tv/ShowSearchResult'
import { Link } from 'react-router-dom'
import { H1, Input, LucideIconWrapper, P } from '../../components/Typography'
import Spinner from '../../components/Spinner'
import ShowSearchResultMediaServer from '../../components/tv/ShowSearchResultMediaServer'

export type ShowSearchResultType = {
  id: number
  name: string
  local_id: number | null
  media_server_id: string | null
  media_server_url: string | null
  url: string
  genres: string[]
  status: string
  summary: string
  premiered: string
  character_name?: string
  ended?: string
  image?: string
  imdb_id: string | null
  imdb_rating: number | null
}

export type MediaServerShowsType = {
  name: string
  media_server_id: string
  media_server_url: string
  status: string
  overview: string | null
  premier_date: string
  image_url: string
  tv_maze_id: string
  tv_maze_url: string
  imdb_id?: string | null
  imdb_rating?: number | null
}

const SearchInputComponent = () => {
  const { get } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ShowSearchResultType[] | null>(null)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value
    setQuery(newQuery)

    if (timer) {
      clearTimeout(timer)
    }

    if (newQuery.length >= 2) {
      setIsLoading(true)
      // Set a new timer for search
      const newTimer = setTimeout(() => {
        get(`tv/remote-search?q=${encodeURIComponent(newQuery)}`)
          .then((data) => {
            setResults(data)
            setIsLoading(false)
          })
          .catch((error) => {
            console.error('Error fetching search results:', error)
            setIsLoading(false)
          })
      }, 500)
      setTimer(newTimer)
    } else {
      setResults([])
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
  }

  return (
    <>
      <div className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search..."
          autoFocus
        />
        {query && (
          <LucideIconWrapper
            name="X"
            title="Clear search"
            onClick={handleClear}
            className="cursor-pointer"
            size={35}
          />
        )}
      </div>
      {isLoading ? (
        <Spinner />
      ) : query === '' || query.length < 2 ? (
        <div className="text-center py-6">
          <P>Enter a search query.</P>
        </div>
      ) : results && results.length > 0 ? (
        results.map((result) => (
          <ShowSearchResult key={result.id} result={result} />
        ))
      ) : (
        <div className="text-center py-6">
          <P>Search query did not return any results.</P>
        </div>
      )}
    </>
  )
}

const MediaServerMissingComponent = () => {
  const { get } = useApi()
  const [isLoadingShows, setIsLoadingShows] = useState(true)
  const [missingShows, setIsMissingShows] = useState<
    MediaServerShowsType[] | null
  >(null)

  const fetchMissingShowsResult = useCallback(async () => {
    try {
      const data = (await get('tv/mediaserver-shows')) as Record<
        string,
        MediaServerShowsType
      >
      if (data) {
        setIsMissingShows(Object.values(data))
      } else {
        setIsMissingShows([])
      }
    } catch (error) {
      console.error('error fetching shows: ', error)
      setIsMissingShows(null)
    } finally {
      setIsLoadingShows(false)
    }
  }, [])

  useEffect(() => {
    fetchMissingShowsResult()
  }, [])

  return (
    <>
      {isLoadingShows || missingShows === null ? (
        <Spinner />
      ) : missingShows.length > 0 ? (
        <>
          {missingShows.map((missingShow) => (
            <ShowSearchResultMediaServer
              key={missingShow.media_server_id}
              missingShow={missingShow}
            />
          ))}
        </>
      ) : (
        <P>All active shows on your mediaserver are tracked.</P>
      )}
    </>
  )
}

const ShowSearchTabs = [
  { label: 'Search', component: SearchInputComponent },
  { label: 'Mediaserver', component: MediaServerMissingComponent },
]

const TVSearch = () => {
  const [activeTabIndex, setActiveTabindex] = useState(0)
  const ActiveTab = ShowSearchTabs[activeTabIndex].component

  return (
    <>
      <title>A3T | Track new TV Show</title>
      <H1>Start tracking a new TV Show</H1>
      <div className="filter-bar">
        <Link to={'/tv'}>
          <LucideIconWrapper
            className="bg-main-fg rounded-lg p-2"
            name="ArrowLeft"
            title="Go back to Shows"
          />
        </Link>
      </div>
      <div className="flex gap-4 border-b border-accent-2 mb-2 pt-4">
        {ShowSearchTabs.map((tab, i) => (
          <P
            onClick={() => setActiveTabindex(i)}
            className={`pb-2 px-2 cursor-pointer ${
              activeTabIndex === i
                ? 'border-b-4 border-accent-2 font-semibold'
                : 'opacity-60'
            }`}
            key={i}
          >
            {tab.label}
          </P>
        ))}
      </div>
      <div className="py-4">
        <ActiveTab />
      </div>
    </>
  )
}

export default TVSearch
