import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageComponent, { ImageType } from './ImageComponent'
import useApi from '../hooks/api'
import TimeComponent from './TimeComponent'
import AddKeywordComponent from './AddKeywordComponent'
import KeywordTableCompnent from './KeywordTableComponent'
import { KeywordType } from './Keywords'
import posterDefault from '../../assets/poster-default.jpg'

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
    <div className="show-detail">
      <div className="show-detail-header">
        <div className="show-poster">
          <ImageComponent image={getShowPoster(showDetail)} alt="show-poster" />
        </div>
        <div className="show-description">
          <h1>{showDetail.name}</h1>
          <span className="smaller">
            ID:{' '}
            <a
              href={showDetail.remote_server_url}
              target="_blank"
              rel="noreferrer"
            >
              {showDetail.remote_server_id}
            </a>
          </span>
          <p dangerouslySetInnerHTML={{ __html: showDetail.description }} />
          <div className="tag-group">
            <span className="tag-item">
              Status: {showDetail.status_display}
            </span>
            {showDetail.release_date && (
              <span className="tag-item">
                Start: <TimeComponent timestamp={showDetail.release_date} />
              </span>
            )}
            {showDetail.end_date && (
              <span className="tag-item">
                End: <TimeComponent timestamp={showDetail.end_date} />
              </span>
            )}
          </div>
        </div>
      </div>
      <button onClick={toggleShowDetails}>
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>
      {showDetails && (
        <>
          <div>
            <button onClick={toggleShowConfirm}>Remove Show</button>
            {showDelete && (
              <>
                <p>Remove &apos;{showDetail.name}&apos; from AutoT?</p>
                <button onClick={handleShowDelete}>Confirm</button>
                <button onClick={toggleShowConfirm}>Cancel</button>
              </>
            )}
          </div>
          <table className="keyword-table">
            <tbody>
              <tr>
                <td>Active</td>
                <td>
                  <input
                    type="checkbox"
                    checked={showDetail.is_active}
                    onChange={handleActiveToggle}
                  />
                </td>
              </tr>
              <tr>
                <td>Search Name</td>
                <td>
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        value={editedSearchName || ''}
                        onChange={handleSearchNameChange}
                      />
                      <button onClick={handleSearchNameSubmit}>Submit</button>
                      <button onClick={handleSearchNameCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span>{showDetail.search_name || ''} </span>
                      <button onClick={() => setEditMode(true)}>Edit</button>
                    </>
                  )}
                </td>
              </tr>
              <tr>
                <td>Add Keyword</td>
                <td>
                  <AddKeywordComponent
                    patchURL={`tv/show/${showDetail.id}/?direction=add`}
                    refreshCallback={fetchShow}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <KeywordTableCompnent
            all_keywords={showDetail.all_keywords}
            patchURL={`tv/show/${showDetail.id}/?direction=remove`}
            refreshCallback={fetchShow}
          />
        </>
      )}
    </div>
  )
}

export default ShowDetail
