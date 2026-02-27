import { useEffect, useState } from 'react'
import { PersonType } from '../../pages/people/Peoples'
import { ShowSearchResultType } from '../../pages/tv/Search'
import useApi from '../../hooks/api'
import { Button, LucideIconWrapper, P } from '../Typography'
import Spinner from '../Spinner'
import ShowSearchResult from '../tv/ShowSearchResult'

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export default function PeopleTVRemoteCredits({
  person,
}: {
  person: PersonType
}) {
  const { get, error } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [resultCount, setResultCount] = useState(0)
  const [nextPage, setNextPage] = useState<string | null>(null)
  const [personRemoteShows, setPersonRemoteShows] = useState<
    ShowSearchResultType[] | null
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
    const fetchRemoteShows = async (
      url = `people/person/${person.id}/search_shows/`,
      append = false,
    ) => {
      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
        setPersonRemoteShows(null)
        setNextPage(null)
        setResultCount(0)
      }

      try {
        const data = (await get(url)) as PaginatedResponse<ShowSearchResultType>
        const results = data?.results ?? []
        setPersonRemoteShows((prev) =>
          append && prev ? [...prev, ...results] : results,
        )
        setNextPage(toApiPath(data?.next ?? null))
        setResultCount(data?.count ?? results.length)
      } catch (error) {
        console.error('error fetching remote shows: ', error)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }

    fetchRemoteShows()
  }, [person.id])

  return (
    <>
      {error ? (
        <P>{error}</P>
      ) : isLoading || personRemoteShows === null ? (
        <Spinner />
      ) : personRemoteShows.length > 0 ? (
        <>
          {personRemoteShows.map((result) => (
            <ShowSearchResult key={result.id} result={result} />
          ))}
          {nextPage && (
            <Button
              onClick={async () => {
                if (!nextPage || isLoadingMore) return
                setIsLoadingMore(true)
                try {
                  const data = (await get(
                    nextPage,
                  )) as PaginatedResponse<ShowSearchResultType>
                  const results = data?.results ?? []
                  setPersonRemoteShows((prev) => [...(prev ?? []), ...results])
                  setNextPage(toApiPath(data?.next ?? null))
                  setResultCount(data?.count ?? personRemoteShows?.length ?? 0)
                } catch (error) {
                  console.error('error fetching more remote shows: ', error)
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
                : `Load more${resultCount > personRemoteShows.length ? ` (+${Math.min(10, resultCount - personRemoteShows.length)}/${resultCount})` : ''}`}
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
