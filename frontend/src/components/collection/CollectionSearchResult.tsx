import { Link } from 'react-router-dom'
import { CollectionSearchResultType } from '../../pages/collection/Search'
import { Button, H2, P, StyledLink } from '../Typography'
import { useState } from 'react'
import useApi from '../../hooks/api'
import { CollectionType } from '../../pages/collection/Collections'

interface CollectionSearchResultInterface {
  result: CollectionSearchResultType
}

const CollectionSearchResult: React.FC<CollectionSearchResultInterface> = ({
  result,
}) => {
  const { post, error } = useApi()
  const [addingCollection, setAddingCollection] = useState<boolean | null>(null)
  const [newCollectionAddedID, setNewCollectionAddedId] = useState<
    number | null
  >(null)

  const handleAddCollection = async (remoteServerId: number) => {
    setAddingCollection(true)
    const newCollection = (await post('movie/collection/', {
      remote_server_id: remoteServerId,
    })) as CollectionType
    if (newCollection) {
      setNewCollectionAddedId(newCollection.id)
    }
    setAddingCollection(false)
  }

  return (
    <div className="p-1 my-1">
      <div className="flex items-center border border-accent-2">
        <div className="p-4 flex-1">
          {result.image && (
            <img className="w-full" src={result.image} alt="movie-poster" />
          )}
        </div>
        <div className="m-2 flex-3">
          <H2>{result.name}</H2>
          <P variant="smaller">
            ID:{' '}
            <StyledLink to={result.url} target="_blank" rel="noreferrer">
              {result.id}
            </StyledLink>
          </P>
          <P>{result.summary}</P>
          <div className="flex gap-2 my-2">
            {result.local_id ? (
              <Link to={`collection/${result.local_id}`}>
                <Button>Open</Button>
              </Link>
            ) : (
              <>
                {addingCollection === null && (
                  <Button onClick={() => handleAddCollection(result.id)}>
                    Add
                  </Button>
                )}
                {addingCollection === true && <P>Loading...</P>}
                {addingCollection === false &&
                  !error &&
                  newCollectionAddedID && (
                    <Link to={`/collection/${newCollectionAddedID}`}>
                      <Button>Open</Button>
                    </Link>
                  )}
                {error && <P>Failed to add: {error}</P>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectionSearchResult
