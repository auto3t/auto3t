import { useCallback, useEffect, useState } from 'react'
import useApi from '../../hooks/api'
import ImageComponent, { ImageType } from '../../components/ImageComponent'
import TimeComponent from '../../components/TimeComponent'
import { useParams } from 'react-router-dom'
import posterDefault from '../../../assets/poster-default.jpg'
import MovieReleases from '../../components/MovieReleases'
import ManualSearch from '../../components/ManualSearch'
import Torrent, { TorrentType } from '../../components/Torrent'

export type MovieType = {
  id: number
  name: string
  name_display: string
  tagline: string
  description: string
  remote_server_url: string
  remote_server_id: string
  release_date: string
  status_display: string | null
  image_movie?: ImageType
  torrent: TorrentType[]
}

const MovieDetail: React.FC = () => {
  const { id } = useParams()
  const { get } = useApi()
  const [movieDetail, setMovieDetail] = useState<MovieType | null>(null)
  const [movieRefresh, setMovieRefresh] = useState(false)

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
    setMovieRefresh(false)
  }, [id, movieRefresh])

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
                <h1>{movieDetail.name_display}</h1>
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
                    {movieDetail?.status_display || 'undefined'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <MovieReleases movie_id={movieDetail.id} />
          {movieDetail.torrent.length > 0 && (
            <>
              <h2>Torrents</h2>
              {movieDetail.torrent?.map((torrent) => (
                <Torrent
                  key={torrent.id}
                  torrent={torrent}
                  setRefresh={setMovieRefresh}
                />
              ))}
            </>
          )}
          <ManualSearch
            searchType="movie"
            searchTypeId={movieDetail.id}
            searchDefault={movieDetail.name_display}
          />
        </>
      )}
    </div>
  )
}

export default MovieDetail
