import { Link } from 'react-router-dom'
import { Button, H1, H2, Input, P } from '../../components/Typography'
import useApi from '../../hooks/api'
import { useState } from 'react'
import Spinner from '../../components/Spinner'
import PeopleSearchResult from '../../components/people/PeopleSearchResult'

export type PersonSearchResultType = {
  id: number
  local_id: null | number
  name: string
  department: null | string
  image: null | string
}

type PersonSearchResponseType = {
  tv: PersonSearchResultType[]
  movie: PersonSearchResultType[]
}

export default function PeopleSearch() {
  const { get } = useApi()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [moviePersonResults, setMoviePersonResults] = useState<
    PersonSearchResultType[] | null
  >(null)
  const [tvPersonResults, setTVPersonResults] = useState<
    PersonSearchResultType[] | null
  >(null)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value
    setQuery(newQuery)

    if (timer) {
      clearTimeout(timer)
    }

    if (newQuery.length >= 2) {
      setIsLoading(true)
      // Set a new timer for search
      const newTimer = setTimeout(async () => {
        try {
          const data = (await get(
            `people/people-search/?q=${encodeURIComponent(newQuery)}`,
          )) as PersonSearchResponseType
          setMoviePersonResults(data.movie)
          setTVPersonResults(data.tv)
          setIsLoading(false)
        } catch (error) {
          console.error('Error fetching search results:', error)
        } finally {
          setIsLoading(false)
        }
      }, 500)
      setTimer(newTimer)
    } else {
      setMoviePersonResults([])
      setTVPersonResults([])
    }
  }

  const handleClear = () => {
    setQuery('')
    setMoviePersonResults([])
    setTVPersonResults([])
  }

  return (
    <>
      <H1>Start tracking a new Person</H1>
      <div className="filter-bar">
        <Link to={'/people'}>
          <Button>Back</Button>
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
        <Button onClick={handleClear}>Clear</Button>
      </div>
      {isLoading ? (
        <Spinner />
      ) : query === '' || query.length < 2 ? (
        <div className="text-center py-6">
          <P>Enter a search query.</P>
        </div>
      ) : (
        <>
          <div className="py-4">
            <H2>Movie Person Results</H2>
            {moviePersonResults && moviePersonResults.length > 0 ? (
              <div className="grid grid-cols-6 gap-2">
                {moviePersonResults.map((person) => (
                  <PeopleSearchResult key={person.id} person={person} />
                ))}
              </div>
            ) : (
              <P>No results.</P>
            )}
          </div>
          <div className="py-4">
            <H2>TV Person Results</H2>
            {tvPersonResults && tvPersonResults.length > 0 ? (
              <div className="grid grid-cols-6 gap-2">
                {tvPersonResults.map((person) => (
                  <PeopleSearchResult key={person.id} person={person} />
                ))}
              </div>
            ) : (
              <P>No results.</P>
            )}
          </div>
        </>
      )}
    </>
  )
}
