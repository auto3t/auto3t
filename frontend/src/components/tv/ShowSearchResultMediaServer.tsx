import { Link } from 'react-router-dom'
import { Button, H2, P, StyledLink, TagItem } from '../Typography'
import ToggleSwitch from '../ConfigToggle'
import TimeComponent from '../TimeComponent'
import { ShowType } from './ShowDetail'
import { useState } from 'react'
import { useProgressStore } from '../../stores/ProgressStore'
import useApi from '../../hooks/api'
import { MediaServerShowsType } from '../../pages/tv/Search'

const ShowSearchResultMediaServer = ({
  missingShow,
}: {
  missingShow: MediaServerShowsType
}) => {
  const { post } = useApi()
  const { setIsPolling } = useProgressStore()

  const [isActive, setIsActive] = useState(true)
  const [newAddedShowID, setNewAddedShowID] = useState<number | null>(null)
  const [addingShow, setAddingShow] = useState<null | boolean>(null)

  const handleAddShow = async (tvmazeId: string) => {
    setAddingShow(true)
    const response = (await post('tv/show/', {
      tvmaze_id: tvmazeId,
      is_active: isActive,
    })) as ShowType
    if (response) {
      setIsPolling(true)
      setNewAddedShowID(response.id)
    }
    setAddingShow(false)
  }

  return (
    <div className="p-1 my-1">
      <div className="md:flex items-center block border border-accent-2">
        <div className="md:w-full w-[75%] mx-auto p-4 flex-1">
          {missingShow.image_url && (
            <img
              className="w-full"
              src={missingShow.image_url}
              alt="show-poster"
            />
          )}
        </div>
        <div className="m-2 p-2 flex-3">
          <H2>{missingShow.name}</H2>
          <div className="inline-grid grid-cols-2 gap-2 py-4">
            <P>tvmaze</P>
            {missingShow.tv_maze_url && missingShow.tv_maze_id ? (
              <StyledLink
                to={missingShow.tv_maze_url}
                target="_blank"
                rel="noreferrer"
              >
                {missingShow.tv_maze_id}
              </StyledLink>
            ) : (
              <P>Missing tvmaze ID</P>
            )}
            {missingShow.imdb_id && (
              <>
                <P>imdb</P>
                <div className="flex gap-2">
                  <StyledLink
                    to={`https://www.imdb.com/title/${missingShow.imdb_id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {missingShow.imdb_id}
                  </StyledLink>
                  {missingShow.imdb_rating && (
                    <P>{missingShow.imdb_rating}/10</P>
                  )}
                </div>
              </>
            )}
          </div>
          {missingShow.overview && (
            <P
              dangerouslySetInnerHTML={{
                __html: missingShow.overview,
              }}
            />
          )}
          <div className="flex gap-2 py-6">
            <TagItem>{`Status: ${missingShow.status}`}</TagItem>
            {missingShow.premier_date && (
              <TagItem>
                Start: {<TimeComponent timestamp={missingShow.premier_date} />}
              </TagItem>
            )}
          </div>
          {newAddedShowID ? (
            <Link to={`/tv/show/${newAddedShowID}`}>
              <Button>Open</Button>
            </Link>
          ) : (
            <div className="flex gap-2">
              <P>Active:</P>
              <ToggleSwitch
                key="active"
                value={isActive}
                onChange={() => setIsActive(!isActive)}
              />
              <Button
                className="pointer"
                onClick={() => handleAddShow(missingShow.tv_maze_id)}
              >
                Add
              </Button>
              {addingShow === true && <P>Loading...</P>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShowSearchResultMediaServer
