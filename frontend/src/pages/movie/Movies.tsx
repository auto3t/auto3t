import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useApi from '../../hooks/api'
import useMovieStore from '../../stores/MovieStore'
import MovieTile from '../../components/MovieTile'
import useUserProfileStore from '../../stores/UserProfileStore'

export default function Movies() {
  const { userProfile, setUserProfile } = useUserProfileStore()
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)
  const { error, get, post } = useApi()
  const { movies, setMovies } = useMovieStore()

  useEffect(() => {
    const fetchMovies = async () => {
      const params = new URLSearchParams()
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

  return (
    <div className="movies">
      <h1>Movies</h1>
      <div className="filter-bar">
        <Link to={'search'}>
          <button>Add</button>
        </Link>
        {userProfile && (
          <>
            <select
              defaultValue={userProfile.movies_production_filter}
              onChange={handleProductionFilterUpdate}
            >
              <option value={''}>--- all production states ---</option>
              <option value="r">Rumored</option>
              <option value="p">Planned</option>
              <option value="i">In Production</option>
              <option value="o">Post Production</option>
              <option value="e">Released</option>
            </select>
            <select
              defaultValue={userProfile.movie_status_filter}
              onChange={handleStatusFilterUpdate}
            >
              <option value={''}>--- all movie status ---</option>
              <option value="u">Upcoming</option>
              <option value="s">Searching</option>
              <option value="d">Downloading</option>
              <option value="f">Finished</option>
              <option value="a">Archived</option>
              <option value="i">Ignored</option>
            </select>
          </>
        )}
      </div>
      <div className="movie-items">
        {isLoadingMovies ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : movies.length > 0 ? (
          movies.map((movie) => <MovieTile key={movie.id} movie={movie} />)
        ) : (
          <p>No Movies found.</p>
        )}
      </div>
    </div>
  )
}
