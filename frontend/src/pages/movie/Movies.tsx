import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useApi from '../../hooks/api'
import useMovieStore from '../../stores/MovieStore'
import MovieTile from '../../components/movie/MovieTile'
import useUserProfileStore from '../../stores/UserProfileStore'
import { Button, H1, Input, P, Select } from '../../components/Typography'

export default function Movies() {
  const { userProfile, setUserProfile } = useUserProfileStore()
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)
  const [movieSearchInput, setMovieSearchInput] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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

  return (
    <>
      <H1>Movies</H1>
      <div className="filter-bar">
        <Link to={'search'}>
          <Button>Add</Button>
        </Link>
        <Button onClick={handleMovieSearchInput}>
          {movieSearchInput ? 'Cancel' : 'Search'}
        </Button>
        {movieSearchInput && (
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        )}
        {userProfile && (
          <>
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
          </>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
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
