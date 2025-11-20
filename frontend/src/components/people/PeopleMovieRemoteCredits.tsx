import { useEffect, useState } from 'react'
import { PersonType } from '../../pages/people/Peoples'
import { Button, LucideIconWrapper, P } from '../Typography'
import useApi from '../../hooks/api'
import { MovieSearchResultType } from '../../pages/movie/Search'
import Spinner from '../Spinner'
import MovieSearchResult from '../movie/MovieSearchResult'

export default function PeopleMovieRemoteCredis({
  person,
}: {
  person: PersonType
}) {
  const { get, error } = useApi()
  const [showAll, setShowAll] = useState(false)
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
  }, [person.id])

  return (
    <>
      {error ? (
        <P>{error}</P>
      ) : isLoading || personRemoteMovies === null ? (
        <Spinner />
      ) : personRemoteMovies.length > 0 ? (
        <>
          {(() => {
            const fullList = personRemoteMovies ?? []
            const list = showAll ? fullList : fullList.slice(0, 10)
            return (
              <>
                {list.map((result) => (
                  <MovieSearchResult key={result.id} result={result} />
                ))}
              </>
            )
          })()}
          {personRemoteMovies.length > 10 && (
            <Button
              onClick={() => setShowAll(!showAll)}
              className="mx-auto block my-4"
              iconBefore={
                showAll ? (
                  <LucideIconWrapper
                    name="ChevronUp"
                    colorClassName="text-white"
                  />
                ) : (
                  <LucideIconWrapper
                    name="ChevronDown"
                    colorClassName="text-white"
                  />
                )
              }
            >
              {showAll
                ? 'Show less'
                : `Show more (+${personRemoteMovies.length - 10})`}
            </Button>
          )}
        </>
      ) : (
        <div className="text-center py-6">
          <P>Search query did not return any results.</P>
        </div>
      )}
    </>
  )
}
