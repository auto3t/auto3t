import { Link } from "react-router-dom"
import ImageComponent from "./ImageComponent";

const MovieTile = ({ movie }) => {

  const getMoviePoster = (movie) => {
    if (movie.image_movie?.image) return movie.image_movie
    return {image: '/poster-default.jpg'}
  }

  return (
    <Link to={`movie/${movie.id}`}>
      <div className="movie-item">
        <ImageComponent image={getMoviePoster(movie)} alt={'movie-poster-' + movie.name} />
        <div className="tile-description">
          <h2>{movie.name}</h2>
        </div>
      </div>
    </Link>
  )
}

export default MovieTile;
