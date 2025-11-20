import { useEffect, useState } from 'react'
import useApi from '../../hooks/api'
import { PersonType } from '../../pages/people/Peoples'
import { H2, P } from '../Typography'
import { ShowType } from '../tv/ShowDetail'
import Spinner from '../Spinner'
import ShowTile from '../tv/ShowTile'

export default function PeopleTVCredits({ person }: { person: PersonType }) {
  const { get } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [personShows, setPersonShows] = useState<ShowType[] | null>(null)

  useEffect(() => {
    const fetchShows = async () => {
      setIsLoading(true)
      try {
        const data = await get(`tv/show/?person_id=${person.id}`)
        setPersonShows(data)
      } catch (error) {
        console.error('errof fetching shows: ', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchShows()
  }, [person.id])

  return (
    <div className="py-4">
      <H2>TV Credits</H2>
      {isLoading || personShows === null ? (
        <Spinner />
      ) : personShows.length > 0 ? (
        <div className="grid md:grid-cols-6 grid-cols-3 gap-2">
          {personShows.map((show) => (
            <ShowTile key={show.id} show={show} />
          ))}
        </div>
      ) : (
        <P>
          No TV show credits found for{' '}
          <span className="text-accent-2">{person.name}</span>.
        </P>
      )}
    </div>
  )
}
