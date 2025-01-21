import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useApi from '../../hooks/api'
import useMovieStore from '../../stores/MovieStore'
import MovieTile from '../../components/MovieTile'

export default function Movies() {
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)
  const { error, get } = useApi()
  const { movies, setMovies } = useMovieStore()

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await get('movie/movie/')
        setMovies(data)
      } catch (error) {
        console.error('error fetching movies:', error)
      }
      setIsLoadingMovies(false)
    }
    fetchMovies()
  }, [setMovies])

  return (
    <div className="movies">
      <h1>Movies</h1>
      <div className="filter-bar">
        <Link to={'search'}>
          <button>Add</button>
        </Link>
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
