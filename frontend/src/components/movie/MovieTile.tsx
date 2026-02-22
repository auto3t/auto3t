import { Link } from 'react-router-dom'
import ImageComponent from '../ImageComponent'
import { MovieType } from '../../pages/movie/MovieDetails'
import posterDefault from '../../../assets/poster-default.jpg'
import ProgressBar from '../ProgressBar'
import { H3, TagItem } from '../Typography'

interface MovieTileInterface {
  movie: MovieType
}

const MovieTile: React.FC<MovieTileInterface> = ({ movie }) => {
  const getMoviePoster = (movie: MovieType) => {
    if (movie.image_movie?.image) return movie.image_movie
    return { image: posterDefault }
  }

  return (
    <Link to={`/movie/movie/${movie.id}`}>
      <div className="relative">
        <ImageComponent
          image={getMoviePoster(movie)}
          alt={'movie-poster-' + movie.name}
        />
        <div className="flex gap-2 absolute top-0 right-0 m-4">
          <TagItem title={movie.status_display}>{movie.status || '-'}</TagItem>
          {movie.imdb_rating && <TagItem>IMDb {movie.imdb_rating}/10</TagItem>}
        </div>
        <ProgressBar torrents={movie?.torrent} />
      </div>
      <div className="text-center">
        <H3>{movie.name_display}</H3>
      </div>
    </Link>
  )
}

export default MovieTile
