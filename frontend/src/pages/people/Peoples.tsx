import { Link } from 'react-router-dom'
import {
  Button,
  H1,
  Input,
  LucideIconWrapper,
  P,
  Select,
} from '../../components/Typography'
import { ImageType } from '../../components/ImageComponent'
import { useEffect, useMemo, useState } from 'react'
import useApi from '../../hooks/api'
import Spinner from '../../components/Spinner'
import PersonTile from '../../components/people/PersonTile'
import useUserProfileStore from '../../stores/UserProfileStore'

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
  tracking_movie: boolean
  tracking_tv: boolean
  is_locked: boolean
}

type PersonResponseType = {
  count: number
  next: string | null
  previous: string | null
  results: PersonType[]
}

export default function Peoples() {
  const { get, post } = useApi()
  const { userProfile, setUserProfile } = useUserProfileStore()
  const [persons, setPersons] = useState<PersonType[]>([])
  const [hasMorePersons, setHasMorePersons] = useState(false)
  const [page, setPage] = useState(1)
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilter, setShowFilter] = useState(false)
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
      if (userProfile) {
        if (userProfile.people_movie_tracking_filter !== null) {
          params.append(
            'tracking-movie',
            String(userProfile.people_movie_tracking_filter),
          )
        }
        if (userProfile.people_tv_tracking_filter !== null) {
          params.append(
            'tracking-tv',
            String(userProfile.people_tv_tracking_filter),
          )
        }
        if (userProfile.people_credit_filter !== null) {
          params.append('credit', userProfile.people_credit_filter)
        }
        if (userProfile.people_locked_filter !== null) {
          params.append('locked', String(userProfile.people_locked_filter))
        }
      }
      try {
        const data = (await get(
          `people/person/?page_size=60&page=${page}&${params.toString()}`,
        )) as PersonResponseType
        setPersons([...persons, ...data.results])
        setHasMorePersons(Boolean(data.next))
      } catch (error) {
        console.error('error fetching people: ', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPersons()
  }, [
    setPersons,
    searchTerm,
    page,
    userProfile?.people_movie_tracking_filter,
    userProfile?.people_tv_tracking_filter,
    userProfile?.people_credit_filter,
    userProfile?.people_locked_filter,
  ])

  const totalActiveFilters = useMemo(() => {
    if (!userProfile) return 0

    let totalFilters = 0
    if (userProfile.people_movie_tracking_filter !== null) totalFilters += 1
    if (userProfile.people_tv_tracking_filter !== null) totalFilters += 1
    if (userProfile.people_locked_filter !== null) totalFilters += 1
    if (userProfile.people_credit_filter !== null) totalFilters += 1

    return totalFilters
  }, [
    userProfile?.people_movie_tracking_filter,
    userProfile?.people_locked_filter,
    userProfile?.people_tv_tracking_filter,
    userProfile?.people_credit_filter,
  ])

  const handleShowSearchInput = async () => {
    if (showSearchInput) {
      setPersons([])
      setShowSearchInput(false)
      setSearchTerm('')
    } else {
      setShowSearchInput(true)
    }
  }

  const handleBoolFilterUpdate = async (
    key:
      | 'people_movie_tracking_filter'
      | 'people_tv_tracking_filter'
      | 'people_locked_filter',
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newValue: boolean | null =
      e.target.value === '' ? null : e.target.value === '1' ? true : false
    const data = Object()
    data[key] = newValue
    setPage(1)
    setPersons([])
    const newProfile = await post('user/profile/', data)
    setUserProfile(newProfile)
  }

  const handleCreditTypeUpdate = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setPage(1)
    setPersons([])
    const newProfile = await post('user/profile/', {
      people_credit_filter: e.target.value || null,
    })
    setUserProfile(newProfile)
  }

  const handleFilterReset = async () => {
    const data = await post('user/profile/', {
      people_movie_tracking_filter: null,
      people_locked_filter: null,
      people_tv_tracking_filter: null,
      people_credit_filter: null,
    })
    if (data) setUserProfile(data)
    setShowFilter(false)
  }

  return (
    <>
      <title>A3T | People</title>
      <H1>People</H1>
      <div className="filter-bar flex gap-2 md:flex-nowrap flex-wrap">
        <Link to={'search'}>
          <LucideIconWrapper
            className="bg-main-fg rounded-lg p-2"
            name="PlusIcon"
            title="Start tracking new movie"
          />
        </Link>
        <div className="flex gap-2">
          <LucideIconWrapper
            className="cursor-pointer bg-main-fg rounded-lg p-2"
            name={showSearchInput ? 'SearchXIcon' : 'SearchIcon'}
            title={showSearchInput ? 'Close search' : 'Search your movies'}
            onClick={handleShowSearchInput}
          />
          {showSearchInput && (
            <Input
              value={searchTerm}
              onChange={(e) => {
                setPersons([])
                setSearchTerm(e.target.value)
              }}
              autoFocus
            />
          )}
        </div>
        {userProfile && (
          <>
            <div className="flex gap-2 md:flex-nowrap flex-wrap">
              <LucideIconWrapper
                name="Funnel"
                onClick={() => setShowFilter(!showFilter)}
                className="cursor-pointer bg-main-fg rounded-lg p-2"
                title={showFilter ? 'Hide filter' : 'Show filter'}
                prefix={totalActiveFilters > 0 ? totalActiveFilters : null}
              />
              {(userProfile.people_movie_tracking_filter !== null ||
                userProfile.people_locked_filter !== null ||
                userProfile.people_tv_tracking_filter !== null ||
                userProfile.people_credit_filter !== null) && (
                <LucideIconWrapper
                  title="Reset all filters"
                  className="cursor-pointer bg-main-fg rounded-lg p-2"
                  name="FunnelX"
                  onClick={handleFilterReset}
                />
              )}
            </div>
            {showFilter && (
              <div className="flex gap-2 md:flex-nowrap flex-wrap">
                <Select
                  defaultValue={
                    userProfile.people_movie_tracking_filter === null
                      ? ''
                      : userProfile.people_movie_tracking_filter
                        ? '1'
                        : '0'
                  }
                  onChange={(e) =>
                    handleBoolFilterUpdate('people_movie_tracking_filter', e)
                  }
                >
                  <option value={''}>--- all movie tracking ---</option>
                  <option value="1">tracking movies</option>
                  <option value="0">not tracking movies</option>
                </Select>
                <Select
                  defaultValue={
                    userProfile.people_tv_tracking_filter === null
                      ? ''
                      : userProfile.people_tv_tracking_filter
                        ? '1'
                        : '0'
                  }
                  onChange={(e) =>
                    handleBoolFilterUpdate('people_tv_tracking_filter', e)
                  }
                >
                  <option value={''}>--- all tv tracking ---</option>
                  <option value="1">tracking tv</option>
                  <option value="0">not tracking tv</option>
                </Select>
                <Select
                  defaultValue={userProfile.people_credit_filter || ''}
                  onChange={(e) => handleCreditTypeUpdate(e)}
                >
                  <option value={''}>--- all credit types ---</option>
                  <option value="m">movie credits</option>
                  <option value="t">tv credits</option>
                </Select>
                <Select
                  defaultValue={
                    userProfile.people_locked_filter === null
                      ? ''
                      : userProfile.people_locked_filter
                        ? '1'
                        : '0'
                  }
                  onChange={(e) =>
                    handleBoolFilterUpdate('people_locked_filter', e)
                  }
                >
                  <option value={''}>--- all locked states ---</option>
                  <option value="1">locked only</option>
                  <option value="0">unlocked only</option>
                </Select>
              </div>
            )}
          </>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : persons && persons.length > 0 ? (
        <>
          <div className="grid md:grid-cols-6 grid-cols-3 gap-2">
            {persons.map((person) => (
              <PersonTile person={person} key={person.id} />
            ))}
          </div>
          {hasMorePersons && (
            <div className="py-4 flex justify-center">
              <Button onClick={() => setPage(page + 1)}>Load more</Button>
            </div>
          )}
        </>
      ) : (
        <P>No Persons found.</P>
      )}
    </>
  )
}
