import { Link } from 'react-router-dom'
import { MovieSearchResultType } from '../pages/movie/Search'
import useApi from '../hooks/api'
import { useState } from 'react'

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
    <div className="movie-detail">
      <div className="movie-detail-header">
        <div className="movie-poster">
          {result.image && <img src={result.image} alt="movie-poster" />}
        </div>
        <div className="movie-description">
          <h2>
            {result.name}{' '}
            {result.release_date &&
              `(${new Date(result.release_date).getFullYear()})`}
          </h2>
          <span className="smaller">
            ID:{' '}
            <a href={result.url} target="_blank" rel="noreferrer">
              {result.id}
            </a>
          </span>
          <p dangerouslySetInnerHTML={{ __html: result.summary }} />
          <div className="tag-group">
            {result.release_date && (
              <span className="tag-item">Released: {result.release_date}</span>
            )}
            {result.local_id ? (
              <Link to={`/tv/show/${result.local_id}/`}>Open</Link>
            ) : (
              <>
                {addingMovie === null && (
                  <button
                    className="pointer"
                    onClick={() => handleAddMovie(result.id)}
                  >
                    Add
                  </button>
                )}
                {addingMovie === true && <p>Loading...</p>}
                {addingMovie === false && !error && <p>Done</p>}
                {error && <span>Failed to add: {error}</span>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieSearchResult
