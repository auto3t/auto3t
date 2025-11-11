import { Link } from 'react-router-dom'
import {
  Button,
  H1,
  H2,
  H3,
  Input,
  P,
  Table,
} from '../../components/Typography'
import useApi from '../../hooks/api'
import { useMemo, useState } from 'react'
import Spinner from '../../components/Spinner'
import PeopleSearchResult from '../../components/people/PeopleSearchResult'
import usePeopleSearchStore from '../../stores/PeopleSearchStore'
import ToggleSwitch from '../../components/ConfigToggle'
import { PersonType } from './Peoples'

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
  const { get, post, error } = useApi()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [addingPerson, setAddingPerson] = useState<boolean | null>(null)
  const [newPersonId, setNewPersonId] = useState<number | null>(null)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const {
    moviePersonResults,
    setMoviePersonResults,
    tvPersonResults,
    setTVPersonResults,
    selectedMoviePerson,
    setSelectedMoviePerson,
    selectedTVPerson,
    setSelectedTVPerson,
  } = usePeopleSearchStore()
  const [trackingMovie, setTrackingMovie] = useState(true)
  const [trackingTV, setTrackingTV] = useState(true)

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
    setSelectedMoviePerson(null)
    setSelectedTVPerson(null)
    setAddingPerson(null)
  }

  const handlePersonCreate = async () => {
    setAddingPerson(true)
    const newPerson = (await post('people/person/', {
      name: selectedTVPerson?.name || selectedMoviePerson?.name,
      tvmaze_id: selectedTVPerson?.id || null,
      the_moviedb_id: selectedMoviePerson?.id || null,
      tracking_movie: trackingMovie,
      tracking_tv: trackingTV,
    })) as PersonType
    if (newPerson) {
      setNewPersonId(newPerson.id)
    }
    setAddingPerson(false)
  }

  const rows = useMemo(() => {
    return [
      [
        'themoviedb',
        selectedMoviePerson?.name,
        selectedMoviePerson?.id,
        selectedMoviePerson ? (
          <ToggleSwitch
            key="tracking-movie"
            value={trackingMovie}
            onChange={() => setTrackingMovie(!trackingMovie)}
          />
        ) : (
          ''
        ),
      ],
      [
        'tvmaze',
        selectedTVPerson?.name,
        selectedTVPerson?.id,
        selectedTVPerson ? (
          <ToggleSwitch
            key="tracking-tv"
            value={trackingTV}
            onChange={() => setTrackingTV(!trackingTV)}
          />
        ) : (
          ''
        ),
      ],
    ]
  }, [selectedMoviePerson, selectedTVPerson, trackingMovie, trackingTV])

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
      {(selectedMoviePerson !== null || selectedTVPerson !== null) && (
        <div>
          <H3>Selected</H3>
          {rows.length > 0 && (
            <Table headers={['Source', 'Name', 'ID', 'Tracking']} rows={rows} />
          )}
          {addingPerson === null && (
            <div className="mt-2">
              <Button onClick={() => handlePersonCreate()}>Add</Button>
            </div>
          )}
          {addingPerson === true && <P>Loading...</P>}
          {addingPerson === false && !error && newPersonId && (
            <Link to={`/people/${newPersonId}`}>
              <Button>Open</Button>
            </Link>
          )}
          {error && <P>Failed to add: {error}</P>}
        </div>
      )}
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
                  <PeopleSearchResult
                    key={person.id}
                    person={person}
                    source="movie"
                  />
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
                  <PeopleSearchResult
                    key={person.id}
                    person={person}
                    source="tv"
                  />
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
