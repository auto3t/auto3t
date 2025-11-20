import { useEffect, useState } from 'react'
import { PersonType } from '../../pages/people/Peoples'
import { ShowSearchResultType } from '../../pages/tv/Search'
import useApi from '../../hooks/api'
import { Button, LucideIconWrapper, P } from '../Typography'
import Spinner from '../Spinner'
import ShowSearchResult from '../tv/ShowSearchResult'

export default function PeopleTVRemoteCredits({
  person,
}: {
  person: PersonType
}) {
  const { get, error } = useApi()
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [personRemoteShows, setPersonRemoteShows] = useState<
    ShowSearchResultType[] | null
  >(null)

  useEffect(() => {
    const fetchRemoteShows = async () => {
      setIsLoading(true)
      try {
        const data = (await get(
          `people/person/${person.id}/search_shows/`,
        )) as ShowSearchResultType[]
        if (data) {
          setPersonRemoteShows(data)
        } else {
          setPersonRemoteShows(null)
        }
      } catch (error) {
        console.error('error fetching remote shows: ', error)
      } finally {
        setIsLoading(false)
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
          {(() => {
            const fullList = personRemoteShows ?? []
            const list = showAll ? fullList : fullList.slice(0, 10)
            return (
              <>
                {list.map((result) => (
                  <ShowSearchResult key={result.id} result={result} />
                ))}
              </>
            )
          })()}
          {personRemoteShows.length > 10 && (
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
                : `Show more (+${personRemoteShows.length - 10})`}
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
