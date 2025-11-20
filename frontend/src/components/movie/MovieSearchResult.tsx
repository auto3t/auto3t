import { Link } from 'react-router-dom'
import { MovieSearchResultType } from '../../pages/movie/Search'
import useApi from '../../hooks/api'
import { useState } from 'react'
import { Button, H2, H3, P, StyledLink, TagItem } from '../Typography'
import TimeComponent from '../TimeComponent'
import { MovieType } from '../../pages/movie/MovieDetails'

interface MovieSearchResultInterface {
  result: MovieSearchResultType
}

const MovieSearchResult: React.FC<MovieSearchResultInterface> = ({
  result,
}) => {
  const { post, error } = useApi()
  const [addingMovie, setAddingMovie] = useState<null | boolean>(null)
  const [newMovieAddedID, setNewMovieAddedID] = useState<number | null>(null)

  const handleAddMovie = async (theMoviedbId: string) => {
    setAddingMovie(true)
    const newMovie = (await post('movie/movie/', {
      the_moviedb_id: theMoviedbId,
    })) as MovieType
    if (newMovie) {
      setNewMovieAddedID(newMovie.id)
    }
    setAddingMovie(false)
  }

  return (
    <div className="p-1 my-1">
      <div className="md:flex items-center block border border-accent-2">
        <div className="md:w-full w-[75%] mx-auto p-4 flex-1">
          {result.image && (
            <img className="w-full" src={result.image} alt="movie-poster" />
          )}
        </div>
        <div className="m-2 p-2 flex-3">
          <H2>
            {result.name}{' '}
            {result.release_date &&
              `(${new Date(result.release_date).getFullYear()})`}
          </H2>
          <div className="inline-grid grid-cols-2 gap-2 py-4">
            <P>themoviedb</P>
            <StyledLink to={result.url} target="_blank" rel="noreferrer">
              {result.id}
            </StyledLink>
          </div>
          {result.character_name && <H3>As: {result.character_name}</H3>}
          <P dangerouslySetInnerHTML={{ __html: result.summary }} />
          <div className="flex gap-2 my-2">
            {result.release_date && (
              <TagItem>
                Released: {<TimeComponent timestamp={result.release_date} />}
              </TagItem>
            )}
            {result.local_id ? (
              <Link to={`/movie/movie/${result.local_id}`}>
                <Button>Open</Button>
              </Link>
            ) : (
              <>
                {addingMovie === null && (
                  <Button onClick={() => handleAddMovie(result.id)}>Add</Button>
                )}
                {addingMovie === true && <P>Loading...</P>}
                {addingMovie === false && !error && newMovieAddedID && (
                  <Link to={`/movie/movie/${newMovieAddedID}`}>
                    <Button>Open</Button>
                  </Link>
                )}
                {error && <P>Failed to add: {error}</P>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieSearchResult
