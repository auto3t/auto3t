import { useState } from 'react'
import { MovieType } from '../../pages/movie/MovieDetails'
import ImageComponent from '../ImageComponent'
import TimeComponent from '../TimeComponent'
import {
  Button,
  H1,
  H3,
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
      <div className="flex gap-2 items-center">
        <div className="flex-1 mx-auto p-6">
          <ImageComponent
            image={getMoviePoster(movieDetail)}
            alt="movie-poster"
          />
        </div>
        <div className="flex-3">
          <H1>{movieDetail.name_display}</H1>
          <H3>{movieDetail.tagline}</H3>
          <P variant="smaller">
            ID:{' '}
            <StyledLink
              to={movieDetail.remote_server_url}
              target="_blank"
              rel="noreferrer"
            >
              {movieDetail.the_moviedb_id}
            </StyledLink>
          </P>
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
                <>
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
                  <Button
                    className="ml-2"
                    onClick={() => setEditMovieStatus(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  Status: {movieDetail?.status_display || 'undefined'}
                  <Button
                    className="ml-2"
                    onClick={() => setEditMovieStatus(true)}
                  >
                    Edit
                  </Button>
                </>
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
        <Button onClick={() => setShowMovieDetail(!showMovieDetail)}>
          {showMovieDetail ? 'Hide Details' : 'Show Details'}
        </Button>
        {showMovieDetail && (
          <>
            <Button
              className="ml-2"
              onClick={() => setMovieDelete(!movieDelete)}
            >
              Remove Movie
            </Button>
            {movieDelete && (
              <div className="flex gap-2 items-center mt-4">
                <P>Remove &apos;{movieDetail.name}&apos; from AutoT?</P>
                <Button onClick={handleMovieDelete}>Confirm</Button>
                <Button onClick={() => setMovieDelete(false)}>Cancel</Button>
              </div>
            )}
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
                  />,
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
