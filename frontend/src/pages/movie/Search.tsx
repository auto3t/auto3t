import { useState } from 'react'
import useApi from '../../hooks/api'
import useMovieSearchStore from '../../stores/MovieSearchStore'
import MovieSearchResult from '../../components/MovieSearchResult'
import { Link } from 'react-router-dom'
import { Button, H1, Input, P } from '../../components/Typography'

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
  const { query, results, setQuery, setResults } = useMovieSearchStore()

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
        get(`movie/remote-search?q=${encodeURIComponent(newQuery)}`)
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

  if (!results) return <></>
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
        <P>Loading...</P>
      ) : results?.length > 0 ? (
        results.map((result) => (
          <MovieSearchResult key={result.id} result={result} />
        ))
      ) : (
        <P>Search query did not return any results.</P>
      )}
    </div>
  )
}

export default MovieSearch
