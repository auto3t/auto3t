import { useEffect, useState } from 'react'
import useApi from '../../hooks/api'
import Spinner from '../Spinner'
import { H3, P, Table } from '../Typography'

type RatingItemType = {
  episode_number: number
  average_rating: number | null
  num_votes: number | null
}

type RatingsType = Record<number, RatingItemType[]>

const getRatingBadgeStyle = (rating: number) => {
  const clamped = Math.max(0, Math.min(10, rating))
  let hue = 0

  if (clamped < 5) {
    // 0..5 => red to orange-red
    hue = (clamped / 5) * 20
  } else if (clamped < 7) {
    // 5..7 => orange-yellow to yellow
    hue = 20 + ((clamped - 5) / 2) * 40
  } else {
    // 7..10 => yellow to green
    hue = 60 + ((clamped - 7) / 3) * 60
  }

  const saturation = clamped >= 8.5 ? 76 : 68
  const lightness = clamped >= 8.5 ? 50 : 60

  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    color: '#1f2937',
  }
}

const renderRatingBadge = (rating: number | null) => {
  if (rating === null) {
    return '-'
  }

  return (
    <span
      className="inline-block rounded px-2 py-0.5"
      style={getRatingBadgeStyle(rating)}
    >
      {rating.toFixed(1)}
    </span>
  )
}

const ShowRatings = ({ showId }: { showId: number }) => {
  const { get } = useApi()

  const [ratings, setRatings] = useState<RatingsType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const data = (await get(`tv/show/${showId}/ratings/`)) as RatingsType
        setRatings(data)
      } finally {
        setIsLoading(false)
      }
    }
    setIsLoading(true)
    fetchRatings()
  }, [showId])

  const seasons = ratings
    ? Object.entries(ratings).sort(([a], [b]) => Number(a) - Number(b))
    : []
  const maxEpisodes = seasons.length
    ? Math.max(...seasons.map(([, episodes]) => episodes.length))
    : 0

  const headers = [
    'Season',
    'Avg',
    ...Array.from({ length: maxEpisodes }, (_, idx) => `E${idx + 1}`),
  ]

  const rows = seasons.map(([season, episodes]) => {
    const ratedEpisodes = episodes.filter(
      (episode): episode is RatingItemType & { average_rating: number } =>
        episode.average_rating !== null,
    )
    const averageInSeason =
      ratedEpisodes.length > 0
        ? ratedEpisodes.reduce(
            (sum, episode) => sum + episode.average_rating,
            0,
          ) / ratedEpisodes.length
        : null

    const ratingsByEpisode = new Map(
      episodes.map((episode) => [
        episode.episode_number,
        episode.average_rating,
      ]),
    )
    const episodeCells = Array.from({ length: maxEpisodes }, (_, idx) =>
      ratingsByEpisode.has(idx + 1)
        ? renderRatingBadge(ratingsByEpisode.get(idx + 1) ?? null)
        : '-',
    )

    return [`S${season}`, renderRatingBadge(averageInSeason), ...episodeCells]
  })

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : !ratings || seasons.length === 0 ? (
        <P>No ratings found.</P>
      ) : (
        <>
          <H3>IMDb Ratings by Season and Episode</H3>
          <Table
            headers={headers}
            rows={rows}
            disableMinWidth
            cellPxClass="px-1"
          />
        </>
      )}
    </div>
  )
}

export default ShowRatings
