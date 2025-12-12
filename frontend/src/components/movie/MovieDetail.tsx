import { useState } from 'react'
import { MovieType } from '../../pages/movie/MovieDetails'
import ImageComponent from '../ImageComponent'
import TimeComponent from '../TimeComponent'
import {
  Button,
  H1,
  H3,
  LucideIconWrapper,
  P,
  Select,
  StyledLink,
  Table,
  TagItem,
} from '../Typography'
import { formatDuration } from '../../utils'
import useApi from '../../hooks/api'
import { useNavigate } from 'react-router-dom'
import posterDefault from '../../../assets/poster-default.jpg'
import ToggleSwitch from '../ConfigToggle'
import AddKeywordComponent from '../AddKeywordComponent'
import KeywordTableCompnent from '../KeywordTableComponent'
import AddTargetBitrateComponent from '../AddTargetBitrateComponent'

interface MovieInterface {
  movieDetail: MovieType
  fetchMovie: () => void
}

const MovieDetail: React.FC<MovieInterface> = ({ movieDetail, fetchMovie }) => {
  const { patch, del } = useApi()
  const navigate = useNavigate()
  const [showMovieDetail, setShowMovieDetail] = useState(false)
  const [movieDelete, setMovieDelete] = useState(false)
  const [editMovieStatus, setEditMovieStatus] = useState(false)

  const handleMovieDelete = () => {
    del(`movie/movie/${movieDetail.id}/`).then(() => {
      navigate('/movie')
    })
  }

  const getMoviePoster = (movieDetail: MovieType) => {
    if (movieDetail.image_movie?.image) return movieDetail.image_movie
    return { image: posterDefault }
  }

  const handleActiveToggle = async () => {
    await patch(`movie/movie/${movieDetail.id}/`, {
      is_active: !movieDetail.is_active,
    })
    fetchMovie()
  }

  const handleMovieStatusUpdate = async (status: string) => {
    try {
      await patch(`movie/movie/${movieDetail.id}/`, { status })
      fetchMovie()
      setEditMovieStatus(false)
    } catch (error) {
      console.error('error updating status: ', error)
    }
  }

  return (
    <div className="border border-accent-1">
      <div className="md:flex gap-2 items-center">
        <div className="md:w-full w-[75%] flex-1 mx-auto p-6">
          <ImageComponent
            image={getMoviePoster(movieDetail)}
            alt="movie-poster"
          />
        </div>
        <div className="m-2 flex-3">
          <H1>{movieDetail.name_display}</H1>
          <H3>{movieDetail.tagline}</H3>
          <div className="inline-grid grid-cols-2 gap-2 py-4">
            <P>themoviedb</P>
            <StyledLink
              to={movieDetail.remote_server_url}
              target="_blank"
              rel="noreferrer"
            >
              {movieDetail.the_moviedb_id}
            </StyledLink>
            <P>imdb</P>
            {movieDetail.imdb_id && (
              <StyledLink
                to={`https://www.imdb.com/title/${movieDetail.imdb_id}`}
                target="_blank"
                rel="noreferrer"
              >
                {movieDetail.imdb_id}
              </StyledLink>
            )}
          </div>
          <P>{movieDetail.description}</P>
          <div className="flex flex-wrap justify-center gap-2 py-4">
            {movieDetail.runtime && (
              <TagItem>
                {`Runtime: ${formatDuration(movieDetail.runtime * 60)}`}
              </TagItem>
            )}
            <TagItem>
              Release: <TimeComponent timestamp={movieDetail.release_date} />
            </TagItem>
            <TagItem>
              {`Production: ${movieDetail?.production_state_display || 'TBD'}`}
            </TagItem>
            <TagItem className="tag-item">
              {editMovieStatus ? (
                <span className="flex gap-3 items-center">
                  <Select
                    defaultValue={movieDetail.status}
                    onChange={(e) => handleMovieStatusUpdate(e.target.value)}
                  >
                    <option value="u">Upcoming</option>
                    <option value="s">Searching</option>
                    <option value="d">Downloading</option>
                    <option value="f">Finished</option>
                    <option value="a">Archived</option>
                    <option value="i">Ignored</option>
                  </Select>
                  <LucideIconWrapper
                    name="X"
                    onClick={() => setEditMovieStatus(false)}
                    className="cursor-pointer bg-main-fg rounded-lg p-2"
                    title="Cancel edit status"
                  />
                </span>
              ) : (
                <span className="flex gap-4 items-center">
                  Status: {movieDetail?.status_display || 'undefined'}
                  <LucideIconWrapper
                    name="Pencil"
                    onClick={() => setEditMovieStatus(true)}
                    className="cursor-pointer bg-main-fg rounded-lg p-2"
                    title="Edit status"
                  />
                </span>
              )}
            </TagItem>
            {movieDetail.target_file_size_str && (
              <TagItem>
                {`Target Filesize: ${movieDetail.target_file_size_str}`}
              </TagItem>
            )}
          </div>
        </div>
      </div>
      <div className="ml-6 mb-6">
        <Button
          onClick={() => setShowMovieDetail(!showMovieDetail)}
          iconBefore={
            showMovieDetail ? (
              <LucideIconWrapper colorClassName="text-white" name="ChevronUp" />
            ) : (
              <LucideIconWrapper
                colorClassName="text-white"
                name="ChevronDown"
              />
            )
          }
        >
          {showMovieDetail ? 'Hide Details' : 'Show Details'}
        </Button>
        {showMovieDetail && (
          <>
            <Table
              rows={[
                [
                  'Active',
                  <ToggleSwitch
                    key="movie-is-active"
                    value={movieDetail.is_active}
                    onChange={handleActiveToggle}
                  />,
                ],
                [
                  'Target Bitrate',
                  <AddTargetBitrateComponent
                    key="movie-target-bitrate"
                    patchURL={`movie/movie/${movieDetail.id}/`}
                    refreshCallback={fetchMovie}
                    defaultTarget={
                      movieDetail?.get_target_bitrate
                        ? movieDetail.get_target_bitrate
                        : null
                    }
                    canDelete={
                      movieDetail.get_target_bitrate?.related?.movie.includes(
                        movieDetail.id,
                      ) || false
                    }
                  />,
                ],
                [
                  'Delete Movie',
                  <div className="flex gap-2" key="show delete">
                    {movieDelete ? (
                      <>
                        <LucideIconWrapper
                          name="Check"
                          title="Confirm delete movie"
                          className="cursor-pointer"
                          colorClassName="text-green-700"
                          onClick={handleMovieDelete}
                        />
                        <LucideIconWrapper
                          name="X"
                          title="Cancel delete movie"
                          className="cursor-pointer"
                          onClick={() => setMovieDelete(false)}
                        />
                      </>
                    ) : (
                      <LucideIconWrapper
                        name="Trash2"
                        title="Delete movie"
                        className="cursor-pointer"
                        onClick={() => setMovieDelete(!movieDelete)}
                      />
                    )}
                  </div>,
                ],
                [
                  'Add Keyword',
                  <AddKeywordComponent
                    key="add-keyword"
                    patchURL={`movie/movie/${movieDetail.id}/?direction=add`}
                    refreshCallback={fetchMovie}
                  />,
                ],
              ]}
            />
            <KeywordTableCompnent
              all_keywords={movieDetail.all_keywords}
              patchURL={`movie/movie/${movieDetail.id}/?direction=remove`}
              refreshCallback={fetchMovie}
              objectType="movie_default"
            />
          </>
        )}
      </div>
    </div>
  )
}

export default MovieDetail
