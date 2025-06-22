import { useEffect, useState } from 'react'
import { Button, H1, Input, P, Select } from '../../components/Typography'
import useApi from '../../hooks/api'
import { ImageType } from '../../components/ImageComponent'
import Spinner from '../../components/Spinner'
import CollectionTile from '../../components/collection/CollectionTile'
import { Link } from 'react-router-dom'
import useUserProfileStore from '../../stores/UserProfileStore'

export type CollectionType = {
  id: number
  image_collection: ImageType
  remote_server_url: string
  remote_server_id: string
  name: string
  description: string
  tracking: boolean
}

export default function Collections() {
  const { userProfile, setUserProfile } = useUserProfileStore()
  const { get, post, error } = useApi()
  const [isLoading, setIsLoading] = useState(true)
  const [collections, setCollections] = useState<CollectionType[]>([])

  const [collectionSearchInput, setCollectionSearchInput] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault()
        setCollectionSearchInput(true)
      } else if (event.key === 'Escape') {
        setCollectionSearchInput(false)
        setSearchTerm('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const fetchCollections = async () => {
      const params = new URLSearchParams()
      if (collectionSearchInput) {
        params.append('q', searchTerm)
      }
      if (userProfile && userProfile.collection_tracking_filter !== null) {
        params.append('tracking', userProfile.collection_tracking_filter)
      }
      try {
        const data = (await get(
          `movie/collection/?${params.toString()}`,
        )) as CollectionType[]
        setCollections(data)
      } catch (error) {
        console.error('error fetching collections: ', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCollections()
  }, [searchTerm, setCollections, userProfile?.collection_tracking_filter])

  const handleCollectionSearchInput = async () => {
    if (collectionSearchInput) {
      setCollectionSearchInput(false)
      setSearchTerm('')
    } else {
      setCollectionSearchInput(true)
    }
  }

  const handleTrackingFilterUpdate = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newTracking: boolean | null =
      event.target.value === '' ? null : event.target.value === '1'
    post('user/profile/', { collection_tracking_filter: newTracking })
      .then((data) => {
        setUserProfile(data)
      })
      .catch((error) => {
        console.error('Error updating status:', error)
      })
  }

  if (error) return <P>{error}</P>

  return (
    <>
      <H1>Movie Collections</H1>
      <div className="filter-bar">
        <Link to={'search'}>
          <Button>Add</Button>
        </Link>
        <Button onClick={handleCollectionSearchInput}>
          {collectionSearchInput ? 'Cancel' : 'Search'}
        </Button>
        {collectionSearchInput && (
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        )}
        {userProfile && (
          <Select
            defaultValue={
              userProfile.collection_tracking_filter === null
                ? ''
                : userProfile.collection_tracking_filter
                  ? '1'
                  : '0'
            }
            onChange={handleTrackingFilterUpdate}
          >
            <option value={''}>--- all ---</option>
            <option value="1">Tracking</option>
            <option value="0">Not Tracking</option>
          </Select>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {collections.map((collection) => (
            <CollectionTile key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <P>No Collections found.</P>
      )}
    </>
  )
}
