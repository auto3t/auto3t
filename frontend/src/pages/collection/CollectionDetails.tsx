import { useParams } from 'react-router-dom'
import { Button, H2, H3, P, TagItem } from '../../components/Typography'
import { useCallback, useEffect, useState } from 'react'
import { CollectionType } from './Collections'
import posterDefault from '../../../assets/poster-default.jpg'
import useApi from '../../hooks/api'
import Spinner from '../../components/Spinner'
import { MovieType } from '../movie/MovieDetails'
import MovieTile from '../../components/movie/MovieTile'
import CollectionDetail from '../../components/collection/CollectionDetail'

type MissingMovieType = {
  the_moviedb_id: string
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

  const year: number | null = missingMovie.release_date
    ? new Date(missingMovie.release_date).getFullYear()
    : null
  const [addingMovie, setAddingMovie] = useState<boolean | null>(null)

  const handleAddMovie = async (theMoviedbId: string) => {
    setAddingMovie(true)
    try {
      await post('movie/movie/', {
        the_moviedb_id: theMoviedbId,
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
              onClick={() => handleAddMovie(missingMovie.the_moviedb_id)}
              className="mr-2 mb-2"
            >
              Add
            </Button>
          )}
          <TagItem variant="alert">
            {addingMovie === true ? 'adding...' : 'missing'}
          </TagItem>
        </div>
      </div>
      <div className="text-center">
        <H3>
          {missingMovie.name}
          {year ? ` (${year})` : ''}
        </H3>
      </div>
    </div>
  )
}

export default function CollectionDetails() {
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
  const [refreshCollection, setRefreshCollection] = useState(false)

  const fetchCollection = useCallback(async () => {
    try {
      const data = (await get(`movie/collection/${id}/`)) as CollectionType
      setCollection(data)
    } catch {
      console.error('error fetching collection')
    } finally {
      setIsLoadingCollection(false)
      setRefreshCollection(false)
    }
  }, [id])

  useEffect(() => {
    fetchCollection()
  }, [id, refreshCollection])

  useEffect(() => {
    const fetchCollectionMovies = async () => {
      if (collection === null) return
      try {
        const data = (await get(
          `movie/movie/?collection=${collection.id}&order-by=release_date`,
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

  return (
    <div className="mb-10">
      {collection && (
        <>
          <title>{`A3T | ${collection.name}`}</title>
          {isLoadingCollection ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <CollectionDetail
              collectionDetail={collection}
              fetchCollection={fetchCollection}
            />
          )}
          <div className="pt-6">
            <H2>Movies in Collection</H2>
            {isLoadingCollectionMovies ? (
              <div className="flex justify-center">
                <Spinner />
              </div>
            ) : collectionMovies.length > 0 ||
              missingCollectionMovies.length > 0 ? (
              <div className="grid md:grid-cols-4 grid-cols-2 gap-2">
                {collectionMovies.map((movie) => (
                  <MovieTile key={movie.id} movie={movie} />
                ))}
                {isLoadingMissing ? (
                  <div className="flex justify-center items-center">
                    <Spinner />
                  </div>
                ) : (
                  missingCollectionMovies.map((missingMovie) => (
                    <MissingMovieTile
                      key={missingMovie.the_moviedb_id}
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
