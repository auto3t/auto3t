import { useState } from 'react'
import useApi from '../../hooks/api'
import ShowSearchResult from '../../components/tv/ShowSearchResult'
import { Link } from 'react-router-dom'
import { H1, Input, LucideIconWrapper, P } from '../../components/Typography'
import Spinner from '../../components/Spinner'

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
}

const TVSearch = () => {
  const { get } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ShowSearchResultType[] | null>(null)

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

export default TVSearch
