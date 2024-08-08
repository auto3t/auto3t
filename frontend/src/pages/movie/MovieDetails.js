import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useApi from "../../hooks/api";
import ImageComponent from "../../components/ImageComponent";
import TimeComponent from "../../components/TimeComponent";

export default function MovieDetail() {
  const { id } = useParams();
  const { error, get } = useApi();
  const [movieDetail, setMovieDetail] = useState(null);

  const fetchMovie = useCallback(async (id) => {
    try {
      const data = await get(`movie/movie/${id}`);
      setMovieDetail(data);
    } catch (error) {
      console.error('error fetching movie detail:', error);
    }
  }, [id])

  useEffect(() => {
    fetchMovie(id)
  }, [id])

  const getMoviePoster = (movieDetail) => {
    if (movieDetail.image_movie?.image) return movieDetail.image_movie
    return {image: '/poster-default.jpg'}
  }


  return (
    <div>
      {movieDetail && (
        <>
          <div className="movie-detail">
            <div className="movie-item">
              <ImageComponent image={getMoviePoster(movieDetail)} alt='movie-poster' />
            </div>
            <div className="movie-description">
              <h1>{movieDetail.name}</h1>
              <h3>{movieDetail.tagline}</h3>
              <span className="smaller">ID: <a href={movieDetail.remote_server_url} target='_blank' rel='noreferrer'>{movieDetail.remote_server_id}</a></span>
              <p>{movieDetail.description}</p>
              <div className="tag-group">
                <span className="tag-item">Release: <TimeComponent timestamp={movieDetail.release_date} /></span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
