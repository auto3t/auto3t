import { useCallback, useEffect, useState } from 'react'
import useApi from '../../hooks/api'
import ImageComponent, { ImageType } from '../../components/ImageComponent'
import { Link, useParams } from 'react-router-dom'
import posterDefault from '../../../assets/poster-default.jpg'
import MovieReleases from '../../components/movie/MovieReleases'
import ManualSearch from '../../components/ManualSearch'
import Torrent, { TorrentType } from '../../components/Torrent'
import { MediaServerMetaType } from '../../components/tv/Episode'
import MediaServerDetail from '../../components/MediaServerDetail'
import { Button, H2, H3, P, StyledLink } from '../../components/Typography'
import { CollectionType } from '../collection/Collections'
import MovieDetail from '../../components/movie/MovieDetail'
import { KeywordType } from '../../components/settings/Keywords'
import { TargetBitrateType } from '../../components/settings/TargetBitrate'

export type MovieType = {
  id: number
  name: string
  name_display: string
  tagline: string
  description: string
  runtime: number | null
  remote_server_url: string
  the_moviedb_id: string
  release_date: string
  status: string
  status_display: string
  production_state_display: string | null
  is_active: boolean
  image_movie?: ImageType
  torrent: TorrentType[]
  media_server_id: string
  media_server_meta: MediaServerMetaType
  media_server_url: string
  collection?: CollectionType
  all_keywords: KeywordType[]
  get_target_bitrate: TargetBitrateType | null
  target_file_size_str: string | null
}

const MovieDetails: React.FC = () => {
  const { id } = useParams()
  const { get } = useApi()
  const [movieDetail, setMovieDetail] = useState<MovieType | null>(null)
  const [movieRefresh, setMovieRefresh] = useState(false)

  const fetchMovie = useCallback(async () => {
    try {
      const data = await get(`movie/movie/${id}/`)
      setMovieDetail(data)
    } catch {
      console.error('error fetching movie detail')
    }
  }, [id])

  useEffect(() => {
    fetchMovie()
    setMovieRefresh(false)
  }, [id, movieRefresh])

  const getCollectionPoster = (collection: CollectionType) => {
    if (collection.image_collection?.image) return collection.image_collection
    return { image: posterDefault }
  }

  return (
    <div className="mb-10">
      {movieDetail && (
        <>
          <MovieDetail movieDetail={movieDetail} fetchMovie={fetchMovie} />
          <div className="py-4">
            <MovieReleases movie_id={movieDetail.id} />
          </div>
          {movieDetail.collection && (
            <>
              <H2>Part of Collection</H2>
              <div className="flex gap-4 items-center p-4 my-4 border border-accent-1">
                <div className="w-50 flex-none">
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
                      {movieDetail.collection.the_moviedb_id}
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

export default MovieDetails
