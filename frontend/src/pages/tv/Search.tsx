import { useState } from 'react'
import useTVSearchStore from '../../stores/TVSearchStore'
import useApi from '../../hooks/api'
import ShowSearchResult from '../../components/ShowSearchResult'
import { Link } from 'react-router-dom'

export type ShowSearchResultType = {
  id: number
  name: string
  local_id?: number
  url: string
  genres: string[]
  status: string
  summary: string
  premiered: string
  ended?: string
  image?: string
}

const TVSearch = () => {
  const { get } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const { query, results, setQuery, setResults } = useTVSearchStore()

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
    <div>
      <h1>Search TV Shows</h1>
      <div className="filter-bar">
        <Link to={'/tv'}>
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
          <ShowSearchResult key={result.id} result={result} />
        ))
      ) : (
        <p>Search query did not return any results.</p>
      )}
    </div>
  )
}

export default TVSearch
