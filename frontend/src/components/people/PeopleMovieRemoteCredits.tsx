import { useEffect, useState } from 'react'
import { PersonType } from '../../pages/people/Peoples'
import { H2, P } from '../Typography'
import useApi from '../../hooks/api'
import { MovieSearchResultType } from '../../pages/movie/Search'
import Spinner from '../Spinner'
import MovieSearchResult from '../movie/MovieSearchResult'

export default function PeopleMovieRemoteCredis({
  person,
}: {
  person: PersonType
}) {
  const { get } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [personRemoteMovies, setPersonRemoteMovies] = useState<
    MovieSearchResultType[] | null
  >(null)

  useEffect(() => {
    const fetchRemoteMovies = async () => {
      setIsLoading(true)
      try {
        const data = (await get(
          `people/person/${person.id}/search_movies/`,
        )) as MovieSearchResultType[]
        if (data) {
          setPersonRemoteMovies(data)
        } else {
          setPersonRemoteMovies(null)
        }
      } catch (error) {
        console.error('failed fetching remote movies: ', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRemoteMovies()
  }, [person])

  return (
    <div className="py-4">
      <H2>Searching Movies</H2>
      {isLoading || personRemoteMovies === null ? (
        <Spinner />
      ) : personRemoteMovies.length > 0 ? (
        personRemoteMovies.map((result) => (
          <MovieSearchResult key={result.id} result={result} />
        ))
      ) : (
        <div className="text-center py-6">
          <P>Search query did not return any results.</P>
        </div>
      )}
    </div>
  )
}
