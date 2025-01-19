import { useEffect, useState } from 'react'
import Episode from '../components/Episode'
import useProcessingEpisodeStore from '../stores/processingEpisodesStore'
import useUpcomingEpisodeStore from '../stores/UpcomingEpisodesStore'
import useApi from '../hooks/api'
import usePolling from '../hooks/usePolling'

const Home: React.FC = () => {
  const { error, get } = useApi()
  const [isLoadingProcessingEpisodes, setIsLoadingProcessingEpisodes] =
    useState(true)
  const [isLoadingUpcomingEpisodes, setIsLoadingUpcomingEpisodes] =
    useState(true)
  const [upcomingItemCount, setUpcomingItemCount] = useState(12)
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(false)
  const { processingEpisodes, setProcessingEpisodes } =
    useProcessingEpisodeStore()
  const { upcomingEpisodes, setUpcomingEpisodes } = useUpcomingEpisodeStore()

  const fetchProcessing = async () => {
    try {
      const data = await get('tv/episode/?status=d,s')
      setProcessingEpisodes(data)
    } catch (error) {
      console.error('error fetching episodes: ', error)
    }
    setIsLoadingProcessingEpisodes(false)
  }

  const fetchUpcomingEpisodes = async () => {
    try {
      const data = await get(
        `tv/episode/?limit=${upcomingItemCount}&status=u&order-by=release_date`,
      )
      setUpcomingEpisodes(data)
      setHasMoreUpcoming(data.length === upcomingItemCount)
    } catch (error) {
      console.error('error fetching episodes: ', error)
    }
    setIsLoadingUpcomingEpisodes(false)
  }

  usePolling(fetchUpcomingEpisodes, 60000, [upcomingItemCount])
  usePolling(fetchProcessing, 30000)

  const handleLoadMoreUpcomingEpisodes = () => {
    setUpcomingItemCount(upcomingItemCount + 12)
  }

  return (
    <div className="movies">
      <h2>Processing Episodes</h2>
      <div className="episode-items">
        {isLoadingProcessingEpisodes ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : processingEpisodes?.length > 0 ? (
          processingEpisodes.map((episode) => (
            <Episode key={episode.id} episode={episode} showShow={true} />
          ))
        ) : (
          <p>No episodes are processing.</p>
        )}
      </div>
      <h2>Upcoming Episodes</h2>
      <div className="episode-items">
        {isLoadingUpcomingEpisodes ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : upcomingEpisodes?.length > 0 ? (
          <>
            {upcomingEpisodes.map((episode) => (
              <Episode key={episode.id} episode={episode} showShow={true} />
            ))}
          </>
        ) : (
          <p>No upcoming episodes found.</p>
        )}
      </div>
      {hasMoreUpcoming && (
        <button onClick={handleLoadMoreUpcomingEpisodes}>Load More</button>
      )}
    </div>
  )
}

export default Home
