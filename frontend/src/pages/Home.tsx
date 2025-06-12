import { useState } from 'react'
import Episode from '../components/Episode'
import useProcessingEpisodeStore from '../stores/processingEpisodesStore'
import useUpcomingEpisodeStore from '../stores/UpcomingEpisodesStore'
import useApi from '../hooks/api'
import usePolling from '../hooks/usePolling'
import { Button, H2, P } from '../components/Typography'
import Spinner from '../components/Spinner'

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
    <>
      <H2>Processing</H2>
      {isLoadingProcessingEpisodes ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <P>Error: {error}</P>
      ) : processingEpisodes?.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {processingEpisodes.map((episode) => (
            <Episode key={episode.id} episode={episode} showShow={true} />
          ))}
        </div>
      ) : (
        <P>No episodes are processing.</P>
      )}
      <H2>Upcoming</H2>
      {isLoadingUpcomingEpisodes ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <P>Error: {error}</P>
      ) : upcomingEpisodes?.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {upcomingEpisodes.map((episode) => (
            <Episode key={episode.id} episode={episode} showShow={true} />
          ))}
        </div>
      ) : (
        <P>No upcoming episodes found.</P>
      )}
      {hasMoreUpcoming && (
        <Button onClick={handleLoadMoreUpcomingEpisodes}>Load More</Button>
      )}
    </>
  )
}

export default Home
