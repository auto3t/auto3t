import { useCallback, useEffect, useState } from 'react'
import useApi from '../../hooks/api'
import ImageComponent, { ImageType } from '../../components/ImageComponent'
import TimeComponent from '../../components/TimeComponent'
import { useParams } from 'react-router-dom'
import posterDefault from '../../../assets/poster-default.jpg'
import MovieReleases from '../../components/MovieReleases'
import ManualSearch from '../../components/ManualSearch'
import Torrent, { TorrentType } from '../../components/Torrent'
import { MediaServerMetaType } from '../../components/Episode'
import MediaServerDetail from '../../components/MediaServerDetail'
import { H1, H2, H3, P, StyledLink, TagItem } from '../../components/Typography'

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
  production_state_display: string | null
  image_movie?: ImageType
  torrent: TorrentType[]
  media_server_id: string
  media_server_meta: MediaServerMetaType
  media_server_url: string
}

const MovieDetail: React.FC = () => {
  const { id } = useParams()
  const { get } = useApi()
  const [movieDetail, setMovieDetail] = useState<MovieType | null>(null)
  const [movieRefresh, setMovieRefresh] = useState(false)

  const fetchMovie = useCallback(
    async (id: number) => {
      try {
        const data = await get(`movie/movie/${id}/`)
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
    <div className="mb-10">
      {movieDetail && (
        <>
          <div className="grid grid-cols-2 items-center">
            <div className="w-100 mx-auto py-6">
              <ImageComponent
                image={getMoviePoster(movieDetail)}
                alt="movie-poster"
              />
            </div>
            <div>
              <H1>{movieDetail.name_display}</H1>
              <H3>{movieDetail.tagline}</H3>
              <P>
                ID:{' '}
                <StyledLink
                  to={movieDetail.remote_server_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {movieDetail.remote_server_id}
                </StyledLink>
              </P>
              <P>{movieDetail.description}</P>
              <div className="flex gap-2 py-4">
                <TagItem>
                  Release:{' '}
                  <TimeComponent timestamp={movieDetail.release_date} />
                </TagItem>
                <TagItem className="tag-item">
                  {movieDetail?.status_display || 'Status: TBD'}
                </TagItem>
                <TagItem>
                  {movieDetail?.production_state_display || 'Production: TBD'}
                </TagItem>
              </div>
            </div>
          </div>
          <div className="py-4">
            <MovieReleases movie_id={movieDetail.id} />
          </div>
          {movieDetail.torrent.length > 0 && (
            <div className="py-4">
              <H2>Torrents</H2>
              {movieDetail.torrent?.map((torrent) => (
                <Torrent
                  key={torrent.id}
                  torrent={torrent}
                  setRefresh={setMovieRefresh}
                />
              ))}
            </div>
          )}
          {movieDetail?.media_server_id && (
            <div className="py-4">
              <MediaServerDetail
                mediaServerDetail={movieDetail.media_server_meta}
                mediaServerURL={movieDetail.media_server_url}
              />
            </div>
          )}
          <div className="pt-4 pb-8">
            <ManualSearch
              searchType="movie"
              searchTypeId={movieDetail.id}
              searchDefault={movieDetail.name_display}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default MovieDetail
