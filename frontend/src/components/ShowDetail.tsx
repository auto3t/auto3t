import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageComponent, { ImageType } from './ImageComponent'
import useApi from '../hooks/api'
import TimeComponent from './TimeComponent'
import AddKeywordComponent from './AddKeywordComponent'
import KeywordTableCompnent from './KeywordTableComponent'
import { KeywordType } from './Keywords'
import posterDefault from '../../assets/poster-default.jpg'
import ToggleSwitch from './ConfigToggle'
import { Button, H1, Input, P, StyledLink, Table, TagItem } from './Typography'

export type ShowType = {
  id: number
  name: string
  description: string
  status_display: string
  release_date: string
  end_date: string
  remote_server_url: string
  is_active: boolean
  remote_server_id: string
  search_name?: string
  image_show?: ImageType
  season_fallback?: ImageType
  episode_fallback?: ImageType
  all_keywords: KeywordType[]
}

interface ShowInterface {
  showDetail: ShowType
  fetchShow: () => void
}

const ShowDetail: React.FC<ShowInterface> = ({ showDetail, fetchShow }) => {
  const navigate = useNavigate()
  const { put, del } = useApi()
  const [showDetails, setShowDetails] = useState(false)
  const [editedSearchName, setEditedSearchName] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const toggleShowDetails = () => {
    setShowDetails(!showDetails)
    setEditedSearchName(showDetail.search_name || '')
    setEditMode(false)
  }

  const handleSearchNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setEditedSearchName(event.target.value)
  }

  const handleSearchNameSubmit = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()

    put(`tv/show/${showDetail.id}/`, { search_name: editedSearchName })
      .then(() => {
        fetchShow()
        setEditMode(false)
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }

  const handleSearchNameCancel = () => {
    setEditedSearchName(showDetail.search_name || '')
    setEditMode(false)
  }

  const handleActiveToggle = () => {
    put(`tv/show/${showDetail.id}/`, {
      is_active: !showDetail.is_active,
    }).catch((error) => {
      console.error('Error:', error)
    })
    fetchShow()
  }

  const getShowPoster = (showDetail: ShowType) => {
    if (showDetail.image_show?.image) return showDetail.image_show
    return { image: posterDefault }
  }

  const toggleShowConfirm = () => {
    setShowDelete(!showDelete)
  }

  const handleShowDelete = () => {
    del(`tv/show/${showDetail.id}/`).then(() => {
      navigate('/tv')
    })
  }

  return (
    <div className="p-1 my-1 border border-accent-2">
      <div className="flex items-center ">
        <div className="p-4 flex-1">
          <ImageComponent image={getShowPoster(showDetail)} alt="show-poster" />
        </div>
        <div className="m-2 flex-3">
          <H1>{showDetail.name}</H1>
          <P variant="smaller">
            ID:{' '}
            <StyledLink
              to={showDetail.remote_server_url}
              target="_blank"
              rel="noreferrer"
            >
              {showDetail.remote_server_id}
            </StyledLink>
          </P>
          <P dangerouslySetInnerHTML={{ __html: showDetail.description }} />
          <div className="flex gap-2 my-2">
            <TagItem>Status: {showDetail.status_display}</TagItem>
            {showDetail.release_date && (
              <TagItem>
                Start: <TimeComponent timestamp={showDetail.release_date} />
              </TagItem>
            )}
            {showDetail.end_date && (
              <TagItem>
                End: <TimeComponent timestamp={showDetail.end_date} />
              </TagItem>
            )}
          </div>
        </div>
      </div>
      <div className="p-4">
        <Button onClick={toggleShowDetails}>
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
        {showDetails && (
          <>
            <Button className="ml-2" onClick={toggleShowConfirm}>
              Remove Show
            </Button>
            {showDelete && (
              <div className="flex gap-2 items-center">
                <P>Remove &apos;{showDetail.name}&apos; from AutoT?</P>
                <Button onClick={handleShowDelete}>Confirm</Button>
                <Button onClick={toggleShowConfirm}>Cancel</Button>
              </div>
            )}
            <Table
              rows={[
                [
                  'Active',
                  <ToggleSwitch
                    key="show-is-active"
                    value={showDetail.is_active}
                    onChange={handleActiveToggle}
                  />,
                ],
                [
                  'Search Name',
                  editMode ? (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={editedSearchName || ''}
                        onChange={handleSearchNameChange}
                      />
                      <Button onClick={handleSearchNameSubmit}>Submit</Button>
                      <Button onClick={handleSearchNameCancel}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <span>{showDetail.search_name || ''} </span>
                      <Button onClick={() => setEditMode(true)}>Edit</Button>
                    </>
                  ),
                ],
                [
                  'Add Keyword',
                  <AddKeywordComponent
                    key="add-keyword"
                    patchURL={`tv/show/${showDetail.id}/?direction=add`}
                    refreshCallback={fetchShow}
                  />,
                ],
              ]}
            />
            <KeywordTableCompnent
              all_keywords={showDetail.all_keywords}
              patchURL={`tv/show/${showDetail.id}/?direction=remove`}
              refreshCallback={fetchShow}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default ShowDetail
