import { useParams } from 'react-router-dom'
import { H1, H2, P, StyledLink } from '../../components/Typography'
import { useEffect, useState } from 'react'
import { CollectionType } from './Collections'
import posterDefault from '../../../assets/poster-default.jpg'
import useApi from '../../hooks/api'
import Spinner from '../../components/Spinner'
import ImageComponent from '../../components/ImageComponent'
import { MovieType } from '../movie/MovieDetails'
import MovieTile from '../../components/MovieTile'

export default function CollectionDetail() {
  const { id } = useParams()
  const { get } = useApi()
  const [isLoadingCollection, setIsLoadingCollection] = useState(true)
  const [isLoadingCollectionMovies, setIsLoadingCollectionMovies] =
    useState(true)
  const [collection, setCollection] = useState<CollectionType | null>(null)
  const [collectionMovies, setCollectionMovies] = useState<MovieType[]>([])

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const data = (await get(`movie/collection/${id}/`)) as CollectionType
        setCollection(data)
      } catch {
        console.error('error fetching collection')
      } finally {
        setIsLoadingCollection(false)
      }
    }
    fetchCollection()
  }, [id])

  useEffect(() => {
    const fetchCollectionMovies = async () => {
      if (collection === null) return
      try {
        const data = (await get(
          `movie/movie/?collection=${collection.id}`,
        )) as MovieType[]
        setCollectionMovies(data)
      } catch {
        console.error('error fetching collection movies')
      } finally {
        setIsLoadingCollectionMovies(false)
      }
    }
    fetchCollectionMovies()
  }, [collection])

  const getCollectionPoster = (collection: CollectionType) => {
    if (collection.image_collection?.image) return collection.image_collection
    return { image: posterDefault }
  }

  return (
    <div className="mb-10">
      {collection && (
        <>
          {isLoadingCollection ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 items-center">
              <div className="w-100 mx-auto py-6">
                <ImageComponent
                  alt="collection-poster"
                  image={getCollectionPoster(collection)}
                />
              </div>
              <div>
                <H1>{collection?.name}</H1>
                <P variant="smaller">
                  ID:{' '}
                  <StyledLink
                    to={collection.remote_server_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {collection.remote_server_id}
                  </StyledLink>
                </P>
                <P>{collection.description}</P>
              </div>
            </div>
          )}
          <div className="pt-6">
            <H2>Movies in Collection</H2>
            {isLoadingCollectionMovies ? (
              <div className="flex justify-center">
                <Spinner />
              </div>
            ) : collectionMovies.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {collectionMovies.map((movie) => (
                  <MovieTile key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <P>No movies in Collection.</P>
            )}
          </div>
        </>
      )}
    </div>
  )
}
