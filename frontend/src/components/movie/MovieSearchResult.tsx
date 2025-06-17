import { Link } from 'react-router-dom'
import { MovieSearchResultType } from '../../pages/movie/Search'
import useApi from '../../hooks/api'
import { useState } from 'react'
import { Button, H2, P, StyledLink, TagItem } from '../Typography'
import TimeComponent from '../TimeComponent'

interface MovieSearchResultInterface {
  result: MovieSearchResultType
}

const MovieSearchResult: React.FC<MovieSearchResultInterface> = ({
  result,
}) => {
  const { post, error } = useApi()
  const [addingMovie, setAddingMovie] = useState<null | boolean>(null)

  const handleAddMovie = (remoteServerId: string) => {
    setAddingMovie(true)
    post('movie/movie/', { remote_server_id: remoteServerId })
      .then((data) => {
        console.log('Movie added successfully: ', JSON.stringify(data))
      })
      .catch((error) => {
        console.error('Error adding movie: ', error)
      })
    setAddingMovie(false)
  }

  return (
    <div className="p-1 my-1">
      <div className="flex items-center border border-accent-2">
        <div className="p-4 flex-1">
          {result.image && (
            <img className="w-full" src={result.image} alt="movie-poster" />
          )}
        </div>
        <div className="m-2 flex-3">
          <H2>
            {result.name}{' '}
            {result.release_date &&
              `(${new Date(result.release_date).getFullYear()})`}
          </H2>
          <P variant="smaller">
            ID:{' '}
            <StyledLink to={result.url} target="_blank" rel="noreferrer">
              {result.id}
            </StyledLink>
          </P>
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
                {addingMovie === false && !error && <P>Done</P>}
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
