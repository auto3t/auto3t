import { Link } from 'react-router-dom'
import ImageComponent from './ImageComponent'
import { MovieType } from '../pages/movie/MovieDetails'
import posterDefault from '../../assets/poster-default.jpg'

interface MovieTileInterface {
  movie: MovieType
}

const MovieTile: React.FC<MovieTileInterface> = ({ movie }) => {
  const getMoviePoster = (movie: MovieType) => {
    if (movie.image_movie?.image) return movie.image_movie
    console.log(posterDefault)
    return { image: posterDefault }
  }

  return (
    <Link to={`movie/${movie.id}`}>
      <div className="movie-item">
        <ImageComponent
          image={getMoviePoster(movie)}
          alt={'movie-poster-' + movie.name}
        />
        <div className="tile-description">
          <h2>{movie.name}</h2>
        </div>
      </div>
    </Link>
  )
}

export default MovieTile
