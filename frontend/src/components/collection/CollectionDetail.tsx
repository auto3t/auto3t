import { useState } from 'react'
import { CollectionType } from '../../pages/collection/Collections'
import ToggleSwitch from '../ConfigToggle'
import ImageComponent from '../ImageComponent'
import {
  Button,
  H1,
  LucideIconWrapper,
  P,
  StyledLink,
  Table,
} from '../Typography'
import useApi from '../../hooks/api'
import { useNavigate } from 'react-router-dom'
import posterDefault from '../../../assets/poster-default.jpg'

interface CollectionInterface {
  collectionDetail: CollectionType
  fetchCollection: () => void
}

const CollectionDetail: React.FC<CollectionInterface> = ({
  collectionDetail,
  fetchCollection,
}) => {
  const { put, del } = useApi()
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [showCollectionDetail, setShowCollectionDetail] = useState(false)
  const navigate = useNavigate()

  const getCollectionPoster = (collection: CollectionType) => {
    if (collection.image_collection?.image) return collection.image_collection
    return { image: posterDefault }
  }

  const handleTrackingToggle = async () => {
    try {
      await put(`movie/collection/${collectionDetail.id}/`, {
        tracking: !collectionDetail?.tracking,
      })
      fetchCollection()
    } catch (error) {
      console.error('failed to update tracking state: ', error)
    }
  }

  const handleCollectionDelete = () => {
    del(`movie/collection/${collectionDetail.id}/`).then(() => {
      navigate('/collection')
    })
  }

  return (
    <div className="border border-accent-1">
      <div className="md:flex gap-2 items-center">
        <div className="md:w-full w-[75%] flex-1 mx-auto p-6">
          <ImageComponent
            alt="collection-poster"
            image={getCollectionPoster(collectionDetail)}
          />
        </div>
        <div className="m-2 flex-3">
          <H1>{collectionDetail?.name}</H1>
          <div className="inline-grid grid-cols-2 gap-2 py-4">
            <P>themoviedb</P>
            <StyledLink
              to={collectionDetail.remote_server_url}
              target="_blank"
              rel="noreferrer"
            >
              {collectionDetail.the_moviedb_id}
            </StyledLink>
          </div>
          <P>{collectionDetail.description}</P>
        </div>
      </div>
      <div className="pl-6 mb-6">
        <Button
          onClick={() => setShowCollectionDetail(!showCollectionDetail)}
          iconBefore={
            showCollectionDetail ? (
              <LucideIconWrapper name="ChevronUp" colorClassName="text-white" />
            ) : (
              <LucideIconWrapper
                name="ChevronDown"
                colorClassName="text-white"
              />
            )
          }
        >
          {showCollectionDetail ? 'Hide Details' : 'Show Details'}
        </Button>
        {showCollectionDetail && (
          <Table
            rows={[
              [
                'Track movies in collection',
                <ToggleSwitch
                  key="tracking"
                  value={collectionDetail?.tracking || false}
                  onChange={handleTrackingToggle}
                />,
              ],
              [
                'Delete Collection and Movies',
                <div className="flex gap-2" key="show delete">
                  {deleteConfirm ? (
                    <>
                      <LucideIconWrapper
                        name="Check"
                        title="Confirm delete Collection and movies"
                        className="cursor-pointer"
                        colorClassName="text-green-700"
                        onClick={handleCollectionDelete}
                      />
                      <LucideIconWrapper
                        name="X"
                        title="Cancel delete collection"
                        className="cursor-pointer"
                        onClick={() => setDeleteConfirm(false)}
                      />
                    </>
                  ) : (
                    <LucideIconWrapper
                      name="Trash2"
                      title="Delete movie"
                      className="cursor-pointer"
                      onClick={() => setDeleteConfirm(!deleteConfirm)}
                    />
                  )}
                </div>,
              ],
            ]}
          />
        )}
      </div>
    </div>
  )
}

export default CollectionDetail
