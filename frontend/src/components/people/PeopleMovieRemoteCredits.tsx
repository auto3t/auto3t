import { useEffect, useState } from 'react'
import { PersonType } from '../../pages/people/Peoples'
import { Button, LucideIconWrapper, P } from '../Typography'
import useApi from '../../hooks/api'
import { MovieSearchResultType } from '../../pages/movie/Search'
import Spinner from '../Spinner'
import MovieSearchResult from '../movie/MovieSearchResult'

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export default function PeopleMovieRemoteCredis({
  person,
}: {
  person: PersonType
}) {
  const { get, error } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [resultCount, setResultCount] = useState(0)
  const [nextPage, setNextPage] = useState<string | null>(null)
  const [personRemoteMovies, setPersonRemoteMovies] = useState<
    MovieSearchResultType[] | null
  >(null)

  const toApiPath = (url: string | null) => {
    if (!url) return null

    try {
      const parsed = new URL(url, window.location.origin)
      const apiPrefix = '/api/'
      const apiIndex = parsed.pathname.indexOf(apiPrefix)
      const relativePath =
        apiIndex >= 0
          ? parsed.pathname.slice(apiIndex + apiPrefix.length)
          : parsed.pathname.replace(/^\/+/, '')
      return `${relativePath}${parsed.search}`
    } catch {
      return url.replace(/^\/+/, '')
    }
  }

  useEffect(() => {
    const fetchRemoteMovies = async () => {
      setIsLoading(true)
      setPersonRemoteMovies(null)
      setNextPage(null)
      setResultCount(0)
      try {
        const data = (await get(
          `people/person/${person.id}/search_movies/`,
        )) as PaginatedResponse<MovieSearchResultType>
        const results = data?.results ?? []
        setPersonRemoteMovies(results)
        setNextPage(toApiPath(data?.next ?? null))
        setResultCount(data?.count ?? results.length)
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
          {personRemoteMovies.map((result) => (
            <MovieSearchResult key={result.id} result={result} />
          ))}
          {nextPage && (
            <Button
              onClick={async () => {
                if (!nextPage || isLoadingMore) return
                setIsLoadingMore(true)
                try {
                  const data = (await get(
                    nextPage,
                  )) as PaginatedResponse<MovieSearchResultType>
                  const results = data?.results ?? []
                  setPersonRemoteMovies((prev) => [...(prev ?? []), ...results])
                  setNextPage(toApiPath(data?.next ?? null))
                  setResultCount(data?.count ?? personRemoteMovies?.length ?? 0)
                } catch (error) {
                  console.error('failed fetching more remote movies: ', error)
                } finally {
                  setIsLoadingMore(false)
                }
              }}
              className="mx-auto block my-4"
              disabled={isLoadingMore}
              iconBefore={
                <LucideIconWrapper
                  name="ChevronDown"
                  colorClassName="text-white"
                />
              }
            >
              {isLoadingMore
                ? 'Loading...'
                : `Load more${resultCount > personRemoteMovies.length ? ` (+${Math.min(10, resultCount - personRemoteMovies.length)}/${resultCount})` : ''}`}
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
