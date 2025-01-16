import { Link } from 'react-router-dom'
import TimeComponent from './TimeComponent'
import { ShowSearchResultType } from '../pages/tv/Search'
import useApi from '../hooks/api'
import { useState } from 'react'

interface ShowSearchResultInterface {
  result: ShowSearchResultType
}

const ShowSearchResult: React.FC<ShowSearchResultInterface> = ({ result }) => {
  const { post, error } = useApi()
  const [addingShow, setAddingShow] = useState<null | Boolean>(null)

  const handleAddShow = (remoteServerId: number) => {
    setAddingShow(true)
    post('tv/show/', { remote_server_id: remoteServerId })
      .then((data) => {
        console.log('Show added successfully: ', JSON.stringify(data))
      })
      .catch((error) => {
        console.error('Error adding show:', error)
      })
    setAddingShow(false)
  }

  return (
    <div className="show-detail">
      <div className="show-detail-header">
        <div className="show-poster">
          {result.image && <img src={result.image} alt="show-poster" />}
        </div>
        <div className="show-description">
          <h2>{result.name}</h2>
          <span className="smaller">
            ID:{' '}
            <a href={result.url} target="_blank" rel="noreferrer">
              {result.id}
            </a>
          </span>
          <p dangerouslySetInnerHTML={{ __html: result.summary }} />
          <div className="tag-group">
            <span className="tag-item">Status: {result.status}</span>
            {result.premiered && (
              <span className="tag-item">
                Start: <TimeComponent timestamp={result.premiered} />
              </span>
            )}
            {result.ended && (
              <span className="tag-item">
                End: <TimeComponent timestamp={result.ended} />
              </span>
            )}
            {result.local_id ? (
              <Link to={`/tv/show/${result.local_id}/`}>Open</Link>
            ) : (
              <>
                {addingShow === null && (
                  <button
                    className="pointer"
                    onClick={() => handleAddShow(result.id)}
                  >
                    Add
                  </button>
                )}
                {addingShow === true && <p>Loading...</p>}
                {addingShow === false && !error && <p>Done</p>}
                {error && <span>Failed to add: {error}</span>}
              </>
            )}
          </div>
          {result.genres.length > 0 && (
            <p>Genres: {result.genres.join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShowSearchResult
