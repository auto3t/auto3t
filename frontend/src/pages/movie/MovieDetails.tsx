import { useCallback, useEffect, useState } from 'react'
import useApi from '../../hooks/api'
import ImageComponent, { ImageType } from '../../components/ImageComponent'
import TimeComponent from '../../components/TimeComponent'
import { useParams } from 'react-router-dom'
import posterDefault from '../../../assets/poster-default.jpg'

export type MovieType = {
  id: number
  name: string
  tagline: string
  description: string
  remote_server_url: string
  remote_server_id: string
  release_date: string
  status_display: string
  image_movie?: ImageType
}

const MovieDetail: React.FC = () => {
  const { id } = useParams()
  const { get } = useApi()
  const [movieDetail, setMovieDetail] = useState<MovieType | null>(null)

  const fetchMovie = useCallback(
    async (id: number) => {
      try {
        const data = await get(`movie/movie/${id}`)
        setMovieDetail(data)
      } catch {
        console.error('error fetching movie detail')
      }
    },
    [id],
  )

  useEffect(() => {
    fetchMovie(parseInt(id || '0'))
  }, [id])

  const getMoviePoster = (movieDetail: MovieType) => {
    if (movieDetail.image_movie?.image) return movieDetail.image_movie
    return { image: posterDefault }
  }

  return (
    <div>
      {movieDetail && (
        <>
          <div className="movie-detail">
            <div className="movie-detail-header">
              <div className="movie-poster">
                <ImageComponent
                  image={getMoviePoster(movieDetail)}
                  alt="movie-poster"
                />
              </div>
              <div className="movie-description">
                <h1>{movieDetail.name}</h1>
                <h3>{movieDetail.tagline}</h3>
                <span className="smaller">
                  ID:{' '}
                  <a
                    href={movieDetail.remote_server_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {movieDetail.remote_server_id}
                  </a>
                </span>
                <p>{movieDetail.description}</p>
                <div className="tag-group">
                  <span className="tag-item">
                    Release:{' '}
                    <TimeComponent timestamp={movieDetail.release_date} />
                  </span>
                  <span className="tag-item">
                    {movieDetail?.status_display}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MovieDetail
