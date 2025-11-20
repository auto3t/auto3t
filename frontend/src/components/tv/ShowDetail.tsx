import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageComponent, { ImageType } from '../ImageComponent'
import useApi from '../../hooks/api'
import TimeComponent from '../TimeComponent'
import AddKeywordComponent from '../AddKeywordComponent'
import KeywordTableCompnent from '../KeywordTableComponent'
import { KeywordType } from '../settings/Keywords'
import posterDefault from '../../../assets/poster-default.jpg'
import ToggleSwitch from '../ConfigToggle'
import {
  Button,
  H1,
  Input,
  LucideIconWrapper,
  P,
  StyledLink,
  Table,
  TagItem,
} from '../Typography'
import ManualSearch from '../ManualSearch'

export type ShowType = {
  id: number
  name: string
  description: string
  status_display: string
  status: string
  release_date: string
  end_date: string
  remote_server_url: string
  is_active: boolean
  tvmaze_id: string
  imdb_id: string | null
  search_query: string
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
  const { put, patch, del } = useApi()
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

  const handleSearchNameSubmit = () => {
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

  const handleActiveToggle = async () => {
    await patch(`tv/show/${showDetail.id}/`, {
      is_active: !showDetail.is_active,
    })
    fetchShow()
  }

  const handleShowDelete = () => {
    del(`tv/show/${showDetail.id}/`).then(() => {
      navigate('/tv')
    })
  }

  return (
    <div className="p-1 my-1 border border-accent-2">
      <div className="md:flex block items-center ">
        <div className="md:w-full w-[75%] mx-auto p-4 flex-1">
          <ImageComponent
            image={
              showDetail.image_show?.image
                ? showDetail.image_show
                : { image: posterDefault }
            }
            alt="show-poster"
          />
        </div>
        <div className="m-2 flex-3">
          <H1>{showDetail.name}</H1>
          <div className="inline-grid grid-cols-2 gap-2 pb-4">
            <P>tvmaze</P>
            <StyledLink
              to={showDetail.remote_server_url}
              target="_blank"
              rel="noreferrer"
            >
              {showDetail.tvmaze_id}
            </StyledLink>
            <P>imdb</P>
            {showDetail.imdb_id && (
              <StyledLink
                to={`https://www.imdb.com/title/${showDetail.imdb_id}`}
                target="_blank"
                rel="noreferrer"
              >
                {showDetail.imdb_id}
              </StyledLink>
            )}
          </div>
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
        <Button
          onClick={toggleShowDetails}
          iconBefore={
            showDetails ? (
              <LucideIconWrapper name="ChevronUp" colorClassName="text-white" />
            ) : (
              <LucideIconWrapper
                name="ChevronDown"
                colorClassName="text-white"
              />
            )
          }
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
        {showDetails && (
          <>
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
                  'Search Alias',
                  editMode ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        type="text"
                        value={editedSearchName || ''}
                        onChange={handleSearchNameChange}
                      />
                      <LucideIconWrapper
                        name="Check"
                        title="Save search alias"
                        className="cursor-pointer"
                        colorClassName="text-green-700"
                        onClick={handleSearchNameSubmit}
                      />
                      <LucideIconWrapper
                        name="X"
                        title="Cancel new search alias"
                        className="cursor-pointer"
                        onClick={handleSearchNameCancel}
                      />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <span>{showDetail.search_name || ''} </span>
                      <LucideIconWrapper
                        name="Pencil"
                        className="cursor-pointer"
                        title="Edit search alias"
                        onClick={() => setEditMode(true)}
                      />
                    </div>
                  ),
                ],
                [
                  'Delete Show',
                  <div className="flex gap-2" key="show delete">
                    {showDelete ? (
                      <>
                        <LucideIconWrapper
                          name="Check"
                          title="Confirm delete show"
                          className="cursor-pointer"
                          colorClassName="text-green-700"
                          onClick={handleShowDelete}
                        />
                        <LucideIconWrapper
                          name="X"
                          title="Cancel delete show"
                          className="cursor-pointer"
                          onClick={() => setShowDelete(false)}
                        />
                      </>
                    ) : (
                      <LucideIconWrapper
                        name="Trash2"
                        title="Delete Show"
                        className="cursor-pointer"
                        onClick={() => setShowDelete(!showDelete)}
                      />
                    )}
                  </div>,
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
            {showDetail.status === 'e' && (
              <ManualSearch
                searchType="show"
                searchTypeId={showDetail.id}
                searchDefault={showDetail.search_query}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ShowDetail
