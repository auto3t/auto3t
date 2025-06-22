import { useState } from 'react'
import { CollectionType } from '../../pages/collection/Collections'
import ToggleSwitch from '../ConfigToggle'
import ImageComponent from '../ImageComponent'
import { Button, H1, P, StyledLink, Table } from '../Typography'
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
      const response = (await put(`movie/collection/${collectionDetail.id}/`, {
        tracking: !collectionDetail?.tracking,
      })) as CollectionType
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

  const tableRows = [
    [
      'Auto add movies',
      <ToggleSwitch
        key="tracking"
        value={collectionDetail?.tracking || false}
        onChange={handleTrackingToggle}
      />,
    ],
  ]

  return (
    <div className="border border-accent-1">
      <div className="flex gap-2 items-center">
        <div className="flex-1 mx-auto p-6">
          <ImageComponent
            alt="collection-poster"
            image={getCollectionPoster(collectionDetail)}
          />
        </div>
        <div className="flex-3">
          <H1>{collectionDetail?.name}</H1>
          <P variant="smaller">
            ID:{' '}
            <StyledLink
              to={collectionDetail.remote_server_url}
              target="_blank"
              rel="noreferrer"
            >
              {collectionDetail.remote_server_id}
            </StyledLink>
          </P>
          <P>{collectionDetail.description}</P>
        </div>
      </div>
      <div className="ml-6 mb-6">
        <Button onClick={() => setShowCollectionDetail(!showCollectionDetail)}>
          {showCollectionDetail ? 'Hide Details' : 'Show Details'}
        </Button>
        {showCollectionDetail && (
          <>
            <Button
              className="ml-2"
              onClick={() => setDeleteConfirm(!deleteConfirm)}
            >
              Remove Collection
            </Button>
            {deleteConfirm && (
              <div className="flex gap-2 items-center mt-4">
                <P>
                  Remove &apos;{collectionDetail.name}&apos; including connected
                  movies from AutoT?
                </P>
                <Button onClick={handleCollectionDelete}>Confirm</Button>
                <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
              </div>
            )}
            <Table rows={tableRows} />
          </>
        )}
      </div>
    </div>
  )
}

export default CollectionDetail
