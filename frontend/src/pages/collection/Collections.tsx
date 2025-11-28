import { useEffect, useMemo, useState } from 'react'
import {
  H1,
  Input,
  LucideIconWrapper,
  P,
  Select,
} from '../../components/Typography'
import useApi from '../../hooks/api'
import { ImageType } from '../../components/ImageComponent'
import Spinner from '../../components/Spinner'
import CollectionTile from '../../components/collection/CollectionTile'
import { Link } from 'react-router-dom'
import useUserProfileStore, {
  UserProfileType,
} from '../../stores/UserProfileStore'

export type CollectionType = {
  id: number
  image_collection: ImageType
  remote_server_url: string
  the_moviedb_id: string
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
  const [showFilter, setShowFilter] = useState(false)

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

  const totalActiveFilters = useMemo(() => {
    if (!userProfile) return 0

    let totalFilters = 0
    if (userProfile.collection_tracking_filter !== null) totalFilters += 1

    return totalFilters
  }, [userProfile?.collection_tracking_filter])

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

  const handleFilterReset = async () => {
    const data = (await post('user/profile/', {
      collection_tracking_filter: null,
    })) as UserProfileType
    if (data) setUserProfile(data)
    setShowFilter(false)
  }

  if (error) return <P>{error}</P>

  return (
    <>
      <title>A3T | Collections</title>
      <H1>Movie Collections</H1>
      <div className="filter-bar">
        <Link to={'search'}>
          <LucideIconWrapper
            className="bg-main-fg rounded-lg p-2"
            name="PlusIcon"
            title="Start tracking new movie"
          />
        </Link>
        <div className="flex gap-2">
          <LucideIconWrapper
            className="cursor-pointer bg-main-fg rounded-lg p-2"
            name={collectionSearchInput ? 'SearchXIcon' : 'SearchIcon'}
            title={
              collectionSearchInput ? 'Close search' : 'Search your Collections'
            }
            onClick={handleCollectionSearchInput}
          />
          {collectionSearchInput && (
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          )}
        </div>
        {userProfile && (
          <>
            <div className="flex gap-2 md:flex-nowrap flex-wrap">
              <LucideIconWrapper
                name="Funnel"
                onClick={() => setShowFilter(!showFilter)}
                className="cursor-pointer bg-main-fg rounded-lg p-2"
                title={showFilter ? 'Hide filter' : 'Show filter'}
                prefix={totalActiveFilters > 0 ? totalActiveFilters : null}
              />
              {userProfile.collection_tracking_filter !== null && (
                <LucideIconWrapper
                  title="Reset all filters"
                  className="cursor-pointer bg-main-fg rounded-lg p-2"
                  name="FunnelX"
                  onClick={handleFilterReset}
                />
              )}
            </div>
            {showFilter && (
              <div className="flex gap-2 md:flex-nowrap flex-wrap">
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
              </div>
            )}
          </>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : collections.length > 0 ? (
        <div className="grid md:grid-cols-4 grid-cols-2 gap-2">
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
