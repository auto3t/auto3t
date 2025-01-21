import { useState } from 'react'
import useApi from '../../hooks/api'
import useMovieSearchStore from '../../stores/MovieSearchStore'
import MovieSearchResult from '../../components/MovieSearchResult'
import { Link } from 'react-router-dom'

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
      <h1>Start track a new Movie</h1>
      <div className="filter-bar">
        <Link to={'/movie'}>
          <button>Back</button>
        </Link>
      </div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search..."
      />
      <button onClick={handleClear}>Clear</button>
      {isLoading ? (
        <p>Loading...</p>
      ) : results?.length > 0 ? (
        results.map((result) => (
          <MovieSearchResult key={result.id} result={result} />
        ))
      ) : (
        <p>Search query did not return any results.</p>
      )}
    </div>
  )
}

export default MovieSearch
