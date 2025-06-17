import { useState } from 'react'
import useApi from '../../hooks/api'
import MovieSearchResult from '../../components/movie/MovieSearchResult'
import { Link } from 'react-router-dom'
import { Button, H1, Input, P } from '../../components/Typography'
import Spinner from '../../components/Spinner'

export type MovieSearchResultType = {
  id: string
  name: string
  release_date: string
  summary: string
  url: string
  local_id?: number
  image?: string
}

const MovieSearch = () => {
  const { get } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MovieSearchResultType[] | null>(null)

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
        get(`movie/movie-search/?q=${encodeURIComponent(newQuery)}`)
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
    <div>
      <H1>Start track a new Movie</H1>
      <div className="filter-bar">
        <Link to={'/movie'}>
          <Button>Back</Button>
        </Link>
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search..."
        />
        <Button onClick={handleClear}>Clear</Button>
      </div>
      {isLoading ? (
        <Spinner />
      ) : query === '' || query.length < 2 ? (
        <div className="text-center py-6">
          <P>Enter a search query.</P>
        </div>
      ) : results && results?.length > 0 ? (
        results.map((result) => (
          <MovieSearchResult key={result.id} result={result} />
        ))
      ) : (
        <div className="text-center py-6">
          <P>Search query did not return any results.</P>
        </div>
      )}
    </div>
  )
}

export default MovieSearch
