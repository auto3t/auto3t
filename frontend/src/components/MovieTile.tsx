import { Link } from 'react-router-dom'
import ImageComponent from './ImageComponent'
import { MovieType } from '../pages/movie/MovieDetails'
import posterDefault from '../../assets/poster-default.jpg'
import ProgressBar from './ProgressBar'
import { H3 } from './Typography'

interface MovieTileInterface {
  movie: MovieType
}

const MovieTile: React.FC<MovieTileInterface> = ({ movie }) => {
  const getMoviePoster = (movie: MovieType) => {
    if (movie.image_movie?.image) return movie.image_movie
    return { image: posterDefault }
  }

  return (
    <Link to={`movie/${movie.id}`}>
      <div>
        <div>
          <ImageComponent
            image={getMoviePoster(movie)}
            alt={'movie-poster-' + movie.name}
          />
          <ProgressBar torrents={movie?.torrent} />
        </div>
        <div className="text-center">
          <H3>{movie.name_display}</H3>
        </div>
      </div>
    </Link>
  )
}

export default MovieTile
