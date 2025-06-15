import { useEffect, useState } from 'react'
import { Button, H1, P } from '../../components/Typography'
import useApi from '../../hooks/api'
import { ImageType } from '../../components/ImageComponent'
import Spinner from '../../components/Spinner'
import CollectionTile from '../../components/CollectionTile'
import { Link } from 'react-router-dom'

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
  const { get, error } = useApi()
  const [isLoading, setIsLoading] = useState(true)
  const [collections, setCollections] = useState<CollectionType[]>([])

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = (await get('movie/collection/')) as CollectionType[]
        setCollections(data)
      } catch (error) {
        console.error('error fetching collections: ', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCollections()
  }, [setCollections])

  if (error) return <P>{error}</P>

  return (
    <>
      <H1>Movie Collections</H1>
      <div className="filter-bar">
        <Link to={'search'}>
          <Button>Add</Button>
        </Link>
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
