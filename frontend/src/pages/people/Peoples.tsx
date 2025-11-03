import { Link } from 'react-router-dom'
import { Button, H1, Input, P } from '../../components/Typography'
import { ImageType } from '../../components/ImageComponent'
import { useEffect, useState } from 'react'
import useApi from '../../hooks/api'
import Spinner from '../../components/Spinner'
import PersonTile from '../../components/people/PersonTile'

export type PersonType = {
  id: number
  image_person: ImageType
  name: string
  tvmaze_id: string | null
  tvmaze_url: string | null
  the_moviedb_id: string | null
  the_moviedb_url: string | null
  imdb_id: string | null
  imdb_url: string | null
}

type PersonResponseType = {
  count: number
  next: string | null
  previous: string | null
  results: PersonType[]
}

export default function Peoples() {
  const { get } = useApi()
  const [persons, setPersons] = useState<PersonType[] | null>([])
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault()
        setShowSearchInput(true)
      } else if (event.key === 'Escape') {
        setShowSearchInput(false)
        setSearchTerm('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const fetchPersons = async () => {
      const params = new URLSearchParams()
      if (showSearchInput) {
        params.append('q', searchTerm)
      }
      try {
        const data = (await get(
          `people/person/?page_size=60&${params.toString()}`,
        )) as PersonResponseType
        setPersons(data.results)
      } catch (error) {
        console.error('error fetching people: ', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPersons()
  }, [setPersons, searchTerm])

  const handleShowSearchInput = async () => {
    if (showSearchInput) {
      setShowSearchInput(false)
      setSearchTerm('')
    } else {
      setShowSearchInput(true)
    }
  }

  return (
    <>
      <H1>People</H1>
      <div className="filter-bar">
        <Link to={'search'}>
          <Button>Add</Button>
        </Link>
        <Button onClick={handleShowSearchInput}>
          {showSearchInput ? 'Cancel' : 'Search'}
        </Button>
        {showSearchInput && (
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : persons && persons.length > 0 ? (
        <div className="grid grid-cols-6 gap-2">
          {persons.map((person) => (
            <PersonTile person={person} key={person.id} />
          ))}
        </div>
      ) : (
        <P>No Persons found.</P>
      )}
    </>
  )
}
