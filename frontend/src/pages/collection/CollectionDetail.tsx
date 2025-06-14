import { useParams } from 'react-router-dom'
import {
  Button,
  H1,
  H2,
  H3,
  P,
  StyledLink,
  TagItem,
} from '../../components/Typography'
import { useEffect, useState } from 'react'
import { CollectionType } from './Collections'
import posterDefault from '../../../assets/poster-default.jpg'
import useApi from '../../hooks/api'
import Spinner from '../../components/Spinner'
import ImageComponent from '../../components/ImageComponent'
import { MovieType } from '../movie/MovieDetails'
import MovieTile from '../../components/MovieTile'

type MissingMovieType = {
  remote_server_id: string
  name: string
  description: string
  tagline: string
  release_date: string
  production_state: string
  image_url: string
}

const MissingMovieTile = function ({
  missingMovie,
}: {
  missingMovie: MissingMovieType
}) {
  const { post } = useApi()

  const year = missingMovie.release_date
    ? `(${new Date('2024-07-24').getFullYear()})`
    : ''
  const [addingMovie, setAddingMovie] = useState<boolean | null>(null)

  const handleAddMovie = async (remoteServerId: string) => {
    setAddingMovie(true)
    try {
      const response = await post('movie/movie/', {
        remote_server_id: remoteServerId,
      })
    } catch (error) {
      console.error('failed to add movie: ', error)
    } finally {
      setAddingMovie(false)
    }
  }

  return (
    <div>
      <div className="relative">
        <img
          src={missingMovie.image_url || posterDefault}
          alt={`missing-movie-poster-${missingMovie.name}`}
        />
        <div className="absolute top-0 right-0 m-4">
          {addingMovie === null && (
            <Button
              onClick={() => handleAddMovie(missingMovie.remote_server_id)}
              className="mr-2"
            >
              Add
            </Button>
          )}
          {addingMovie === true && <Spinner />}
          <TagItem variant="alert">missing</TagItem>
        </div>
      </div>
      <div className="text-center">
        <H3>
          {missingMovie.name} {year}
        </H3>
      </div>
    </div>
  )
}

export default function CollectionDetail() {
  const { id } = useParams()
  const { get } = useApi()
  const [isLoadingCollection, setIsLoadingCollection] = useState(true)
  const [isLoadingCollectionMovies, setIsLoadingCollectionMovies] =
    useState(true)
  const [isLoadingMissing, setIsLoadingMissing] = useState(true)
  const [collection, setCollection] = useState<CollectionType | null>(null)
  const [collectionMovies, setCollectionMovies] = useState<MovieType[]>([])
  const [missingCollectionMovies, setMissingCollectionMovies] = useState<
    MissingMovieType[]
  >([])

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

  useEffect(() => {
    const fetchMissingInCollection = async () => {
      try {
        const data = (await get(
          `movie/collection/${id}/missing/`,
        )) as MissingMovieType[]
        setMissingCollectionMovies(data)
      } catch (error) {
        console.error('failed to load missing videos of collection: ', error)
      } finally {
        setIsLoadingMissing(false)
      }
    }
    fetchMissingInCollection()
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
            ) : collectionMovies.length > 0 ||
              missingCollectionMovies.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {collectionMovies.map((movie) => (
                  <MovieTile key={movie.id} movie={movie} />
                ))}
                {isLoadingMissing ? (
                  <Spinner />
                ) : (
                  missingCollectionMovies.map((missingMovie) => (
                    <MissingMovieTile
                      key={missingMovie.remote_server_id}
                      missingMovie={missingMovie}
                    />
                  ))
                )}
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
