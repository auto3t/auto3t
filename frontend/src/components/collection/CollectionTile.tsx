import { Link } from 'react-router-dom'
import { CollectionType } from '../../pages/collection/Collections'
import posterDefault from '../../../assets/poster-default.jpg'
import { H3 } from '../Typography'
import ImageComponent from '../ImageComponent'

interface CollectionTileInterface {
  collection: CollectionType
}

const CollectionTile: React.FC<CollectionTileInterface> = ({ collection }) => {
  const getCollectionPoster = (collection: CollectionType) => {
    if (collection.image_collection?.image) return collection.image_collection
    return { image: posterDefault }
  }

  return (
    <Link to={`/collection/${collection.id}`}>
      <div>
        <ImageComponent
          image={getCollectionPoster(collection)}
          alt={`collection-pster-${collection.name}`}
        />
      </div>
      <div className="text-center">
        <H3>{collection.name}</H3>
      </div>
    </Link>
  )
}

export default CollectionTile
