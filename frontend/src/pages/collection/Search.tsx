import { Link } from 'react-router-dom'
import { H1, Input, LucideIconWrapper, P } from '../../components/Typography'
import { useState } from 'react'
import useApi from '../../hooks/api'
import Spinner from '../../components/Spinner'
import CollectionSearchResult from '../../components/collection/CollectionSearchResult'

export type CollectionSearchResultType = {
  id: number
  local_id: number
  name: string
  summary: string
  url: string
  image: string
}

export default function CollectionSearch() {
  const { get } = useApi()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<CollectionSearchResultType[] | null>(
    null,
  )
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
        get(`movie/collection-search/?q=${encodeURIComponent(newQuery)}`)
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
      <title>A3T | Track new Collection</title>
      <H1>Start tracking a new Movie Collection</H1>
      <div className="filter-bar">
        <Link to={'/collection'}>
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
          <CollectionSearchResult key={result.id} result={result} />
        ))
      ) : (
        <div className="text-center py-6">
          <P>Search query did not return any results.</P>
        </div>
      )}
    </>
  )
}
