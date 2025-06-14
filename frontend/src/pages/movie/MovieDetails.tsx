import { useCallback, useEffect, useState } from 'react'
import useApi from '../../hooks/api'
import ImageComponent, { ImageType } from '../../components/ImageComponent'
import TimeComponent from '../../components/TimeComponent'
import { Link, useParams } from 'react-router-dom'
import posterDefault from '../../../assets/poster-default.jpg'
import MovieReleases from '../../components/MovieReleases'
import ManualSearch from '../../components/ManualSearch'
import Torrent, { TorrentType } from '../../components/Torrent'
import { MediaServerMetaType } from '../../components/Episode'
import MediaServerDetail from '../../components/MediaServerDetail'
import {
  Button,
  H1,
  H2,
  H3,
  P,
  StyledLink,
  TagItem,
} from '../../components/Typography'
import { CollectionType } from '../collection/Collections'

export type MovieType = {
  id: number
  name: string
  name_display: string
  tagline: string
  description: string
  remote_server_url: string
  remote_server_id: string
  release_date: string
  status: string
  status_display: string
  production_state_display: string | null
  image_movie?: ImageType
  torrent: TorrentType[]
  media_server_id: string
  media_server_meta: MediaServerMetaType
  media_server_url: string
  collection?: CollectionType
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

  const getCollectionPoster = (collection: CollectionType) => {
    if (collection.image_collection?.image) return collection.image_collection
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
              <P variant="smaller">
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
                <TagItem>
                  {`Production: ${movieDetail?.production_state_display || 'TBD'}`}
                </TagItem>
                <TagItem className="tag-item">
                  {`Status: ${movieDetail?.status_display || 'TBD'}`}
                </TagItem>
              </div>
            </div>
          </div>
          {movieDetail.collection && (
            <>
              <H2>Part of Collection</H2>
              <div className="flex gap-4 items-center p-4 my-4 border border-accent-1">
                <div className="w-50">
                  <ImageComponent
                    alt={`collection-poster-${movieDetail.collection.name}`}
                    image={getCollectionPoster(movieDetail.collection)}
                  />
                </div>
                <div>
                  <H3>{movieDetail.collection.name}</H3>
                  <P variant="smaller">
                    ID:{' '}
                    <StyledLink
                      to={movieDetail.collection.remote_server_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {movieDetail.collection.remote_server_id}
                    </StyledLink>
                  </P>
                  <P className="mb-2">{movieDetail.collection.description}</P>
                  <Link to={`/collection/${movieDetail.collection.id}`}>
                    <Button>Details</Button>
                  </Link>
                </div>
              </div>
            </>
          )}
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
