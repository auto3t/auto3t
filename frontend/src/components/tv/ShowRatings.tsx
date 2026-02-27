import { useEffect, useState } from 'react'
import useApi from '../../hooks/api'
import Spinner from '../Spinner'
import { P } from '../Typography'

type RatingItemType = {
  episode_number: number
  average_rating: number
  num_votes: number
}

type RatingsType = Record<number, RatingItemType[]>

const ShowRatings = ({ showId }: { showId: number }) => {
  const { get } = useApi()

  const [ratings, setRatings] = useState<RatingsType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchRatings = async () => {
      const data = (await get(`tv/show/${showId}/ratings/`)) as RatingsType
      setRatings(data)
    }
    setIsLoading(true)
    fetchRatings()
    setIsLoading(false)
  }, [showId])

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : !ratings ? (
        <P>No ratings found.</P>
      ) : (
        <>
          <P>IMDb Ratings</P>
          {Object.entries(ratings).map(([season, episodes]) => (
            <div key={season} className="flex gap-2">
              <P>{`S${season}`}</P>
              {episodes.map((episode, idx) => (
                <P key={`episode-${idx}`}>{episode.average_rating}</P>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default ShowRatings
