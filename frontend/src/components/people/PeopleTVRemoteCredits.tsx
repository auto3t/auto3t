import { useEffect, useState } from 'react'
import { PersonType } from '../../pages/people/Peoples'
import { ShowSearchResultType } from '../../pages/tv/Search'
import useApi from '../../hooks/api'
import { H2, P } from '../Typography'
import Spinner from '../Spinner'
import ShowSearchResult from '../tv/ShowSearchResult'

export default function PeopleTVRemoteCredits({
  person,
}: {
  person: PersonType
}) {
  const { get } = useApi()
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
  }, [person])

  return (
    <div className="py-4">
      <H2>Searching Shows</H2>
      {isLoading || personRemoteShows === null ? (
        <Spinner />
      ) : personRemoteShows.length > 0 ? (
        personRemoteShows.map((result) => (
          <ShowSearchResult key={result.id} result={result} />
        ))
      ) : (
        <div className="text-center py-6">
          <P>Search query did not return any results.</P>
        </div>
      )}
    </div>
  )
}
