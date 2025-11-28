import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useApi from '../../hooks/api'
import useMovieStore from '../../stores/MovieStore'
import MovieTile from '../../components/movie/MovieTile'
import useUserProfileStore, {
  UserProfileType,
} from '../../stores/UserProfileStore'
import {
  H1,
  Input,
  LucideIconWrapper,
  P,
  Select,
} from '../../components/Typography'

export default function Movies() {
  const { userProfile, setUserProfile } = useUserProfileStore()
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)
  const [movieSearchInput, setMovieSearchInput] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const { error, get, post } = useApi()
  const { movies, setMovies } = useMovieStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault()
        setMovieSearchInput(true)
      } else if (event.key === 'Escape') {
        setMovieSearchInput(false)
        setSearchTerm('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const fetchMovies = async () => {
      const params = new URLSearchParams()
      if (movieSearchInput) {
        params.append('q', searchTerm)
      }
      if (userProfile?.movie_status_filter) {
        params.append('status', userProfile.movie_status_filter)
      }
      if (userProfile?.movies_production_filter) {
        params.append('production_state', userProfile.movies_production_filter)
      }
      if (userProfile && userProfile?.movies_active_filter !== null) {
        params.append('is_active', userProfile.movies_active_filter)
      }
      try {
        const data = await get(`movie/movie/?${params.toString()}`)
        setMovies(data)
      } catch (error) {
        console.error('error fetching movies:', error)
      }
      setIsLoadingMovies(false)
    }
    fetchMovies()
  }, [
    setMovies,
    searchTerm,
    userProfile?.movies_production_filter,
    userProfile?.movies_active_filter,
    userProfile?.movie_status_filter,
  ])

  const totalActiveFilters = useMemo(() => {
    if (!userProfile) return 0

    let totalFilters = 0
    if (userProfile.movies_production_filter !== null) totalFilters += 1
    if (userProfile.movie_status_filter !== null) totalFilters += 1
    if (userProfile.movies_active_filter !== null) totalFilters += 1

    return totalFilters
  }, [
    userProfile?.movies_production_filter,
    userProfile?.movies_active_filter,
    userProfile?.movie_status_filter,
  ])

  const handleProductionFilterUpdate = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newProduction = event.target.value === '' ? null : event.target.value
    post('user/profile/', { movies_production_filter: newProduction })
      .then((data) => {
        setUserProfile(data)
      })
      .catch((error) => {
        console.error('Error updating status:', error)
      })
  }

  const handleStatusFilterUpdate = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = event.target.value === '' ? null : event.target.value
    post('user/profile/', { movie_status_filter: newStatus })
      .then((data) => {
        setUserProfile(data)
      })
      .catch((error) => {
        console.error('Error updating status:', error)
      })
  }

  const handleMovieSearchInput = async () => {
    if (movieSearchInput) {
      setMovieSearchInput(false)
      setSearchTerm('')
    } else {
      setMovieSearchInput(true)
    }
  }

  const handleActiveFilterUpdate = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newActive: boolean | null =
      event.target.value === '' ? null : event.target.value === '1'
    post('user/profile/', { movies_active_filter: newActive })
      .then((data) => {
        setUserProfile(data)
      })
      .catch((error) => {
        console.error('Error updating status:', error)
      })
  }

  const handleFilterReset = async () => {
    const data = (await post('user/profile/', {
      movies_production_filter: null,
      movies_active_filter: null,
      movie_status_filter: null,
    })) as UserProfileType
    if (data) setUserProfile(data)
    setShowFilter(false)
  }

  return (
    <>
      <title>A3T | Movies</title>
      <H1>Movies</H1>
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
            name={movieSearchInput ? 'SearchXIcon' : 'SearchIcon'}
            title={movieSearchInput ? 'Close search' : 'Search your movies'}
            onClick={handleMovieSearchInput}
          />
          {movieSearchInput && (
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {(userProfile.movie_status_filter !== null ||
                userProfile.movies_active_filter !== null ||
                userProfile.movies_production_filter !== null) && (
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
                  defaultValue={userProfile.movies_production_filter}
                  onChange={handleProductionFilterUpdate}
                >
                  <option value={''}>--- all production states ---</option>
                  <option value="r">Rumored</option>
                  <option value="p">Planned</option>
                  <option value="i">In Production</option>
                  <option value="o">Post Production</option>
                  <option value="e">Released</option>
                </Select>
                <Select
                  defaultValue={userProfile.movie_status_filter}
                  onChange={handleStatusFilterUpdate}
                >
                  <option value={''}>--- all movie status ---</option>
                  <option value="n">None</option>
                  <option value="u">Upcoming</option>
                  <option value="s">Searching</option>
                  <option value="d">Downloading</option>
                  <option value="f">Finished</option>
                  <option value="a">Archived</option>
                  <option value="i">Ignored</option>
                </Select>
                <Select
                  defaultValue={
                    userProfile.movies_active_filter === null
                      ? ''
                      : userProfile.movies_active_filter
                        ? '1'
                        : '0'
                  }
                  onChange={handleActiveFilterUpdate}
                >
                  <option value={''}>--- all ---</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </Select>
              </div>
            )}
          </>
        )}
      </div>
      <div className="grid md:grid-cols-4 grid-cols-2 gap-2">
        {isLoadingMovies ? (
          <P>Loading...</P>
        ) : error ? (
          <P>Error: {error}</P>
        ) : movies.length > 0 ? (
          movies.map((movie) => <MovieTile key={movie.id} movie={movie} />)
        ) : (
          <P>No Movies found.</P>
        )}
      </div>
    </>
  )
}
