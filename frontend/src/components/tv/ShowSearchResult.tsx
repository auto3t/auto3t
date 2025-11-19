import { Link } from 'react-router-dom'
import TimeComponent from '../TimeComponent'
import { ShowSearchResultType } from '../../pages/tv/Search'
import useApi from '../../hooks/api'
import { useState } from 'react'
import { Button, H2, H3, P, StyledLink, TagItem } from '../Typography'
import { ShowType } from './ShowDetail'
import ToggleSwitch from '../ConfigToggle'
import { useProgressStore } from '../../stores/ProgressStore'

interface ShowSearchResultInterface {
  result: ShowSearchResultType
}

const ShowSearchResult: React.FC<ShowSearchResultInterface> = ({ result }) => {
  const { post, error } = useApi()
  const { setIsPolling } = useProgressStore()
  const [addingShow, setAddingShow] = useState<null | boolean>(null)
  const [newAddedShowID, setNewAddedShowID] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(true)

  const handleAddShow = async (tvmazeId: number) => {
    setAddingShow(true)
    const response = (await post('tv/show/', {
      tvmaze_id: tvmazeId,
      is_active: isActive,
    })) as ShowType
    if (response) {
      setNewAddedShowID(response.id)
      setIsPolling(true)
    }
    setAddingShow(false)
  }

  return (
    <div className="p-1 my-1">
      <div className="md:flex items-center block border border-accent-2">
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
          {result.character_name && <H3>As: {result.character_name}</H3>}
          <P dangerouslySetInnerHTML={{ __html: result.summary }} />
          {result.genres.length > 0 && (
            <P className="mt-4">Genres: {result.genres.join(', ')}</P>
          )}
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
          </div>
          <div>
            <div className="mb-4">
              {result.local_id ? (
                <Link to={`/tv/show/${result.local_id}`}>
                  <Button>Open</Button>
                </Link>
              ) : (
                <>
                  {addingShow === null && (
                    <div className="flex gap-2">
                      <P>Active:</P>
                      <ToggleSwitch
                        key="active"
                        value={isActive}
                        onChange={() => setIsActive(!isActive)}
                      />
                      <Button
                        className="pointer"
                        onClick={() => handleAddShow(result.id)}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                  {addingShow === true && <P>Loading...</P>}
                  {addingShow === false && !error && newAddedShowID && (
                    <Link to={`/tv/show/${newAddedShowID}`}>
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
    </div>
  )
}

export default ShowSearchResult
