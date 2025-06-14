import { Link } from 'react-router-dom'
import TimeComponent from './TimeComponent'
import { ShowSearchResultType } from '../pages/tv/Search'
import useApi from '../hooks/api'
import { useState } from 'react'
import { Button, H2, P, StyledLink, TagItem } from './Typography'

interface ShowSearchResultInterface {
  result: ShowSearchResultType
}

const ShowSearchResult: React.FC<ShowSearchResultInterface> = ({ result }) => {
  const { post, error } = useApi()
  const [addingShow, setAddingShow] = useState<null | boolean>(null)

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
    <div className="p-1 my-1">
      <div className="flex items-center border border-accent-2">
        <div className="p-4 flex-1">
          {result.image && (
            <img className="w-full" src={result.image} alt="show-poster" />
          )}
        </div>
        <div className="m-2 p-2 flex-3">
          <H2>{result.name}</H2>
          <P variant="smaller">
            ID:{' '}
            <StyledLink to={result.url} target="_blank" rel="noreferrer">
              {result.id}
            </StyledLink>
          </P>
          <P dangerouslySetInnerHTML={{ __html: result.summary }} />
          <div className="flex gap-2 py-6">
            <TagItem>{`Status: ${result.status}`}</TagItem>
            {result.premiered && (
              <TagItem>
                Start: {<TimeComponent timestamp={result.premiered} />}
              </TagItem>
            )}
            {result.ended && (
              <TagItem>
                End: {<TimeComponent timestamp={result.ended} />}
              </TagItem>
            )}
            {result.local_id ? (
              <Link to={`/tv/show/${result.local_id}`}>
                <Button>Open</Button>
              </Link>
            ) : (
              <>
                {addingShow === null && (
                  <Button
                    className="pointer"
                    onClick={() => handleAddShow(result.id)}
                  >
                    Add
                  </Button>
                )}
                {addingShow === true && <P>Loading...</P>}
                {addingShow === false && !error && <P>Done</P>}
                {error && <P>Failed to add: {error}</P>}
              </>
            )}
          </div>
          {result.genres.length > 0 && (
            <P>Genres: {result.genres.join(', ')}</P>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShowSearchResult
