import { useState } from 'react'
import Episode, { EpisodeType } from '../components/Episode'
import useApi from '../hooks/api'
import usePolling from '../hooks/usePolling'
import { Button, H2, H3, P } from '../components/Typography'
import Spinner from '../components/Spinner'
import { MovieType } from './movie/MovieDetails'
import MovieTile from '../components/movie/MovieTile'

const Home: React.FC = () => {
  const { error, get } = useApi()
  const [isLoadingProcessingEpisodes, setIsLoadingProcessingEpisodes] =
    useState(true)
  const [isLoadingUpcomingEpisodes, setIsLoadingUpcomingEpisodes] =
    useState(true)
  const [isLoadingProcessingMovies, setIsLoadingProcessingMovies] =
    useState(true)
  const [isLoadingUpcomingMovies, setIsLoadingUpcomingMovies] = useState(true)

  const [processingEpisodes, setProcessingEpisodes] = useState<EpisodeType[]>(
    [],
  )
  const [upcomingEpisodes, setUpcomingEpisodes] = useState<EpisodeType[]>([])
  const [upcomingEpisodeCount, setUpcomingEpisodeCount] = useState(12)
  const [hasMoreUpcomingEpisodes, setHasMoreUpcomingEpisodes] = useState(false)

  const [processingMovies, setProcessingMovies] = useState<MovieType[]>([])
  const [upcomingMovies, setUpcomingMovies] = useState<MovieType[]>([])
  const [upcomingMovieCount, setUpcomingMovieCount] = useState(12)
  const [hasMoreUpcomingMovies, setHasMoreUpcomingMovies] = useState(false)

  const fetchProcessingEpisodes = async () => {
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
        `tv/episode/?limit=${upcomingEpisodeCount}&status=u&order-by=release_date`,
      )
      setUpcomingEpisodes(data)
      setHasMoreUpcomingEpisodes(data.length === upcomingEpisodeCount)
    } catch (error) {
      console.error('error fetching episodes: ', error)
    }
    setIsLoadingUpcomingEpisodes(false)
  }

  const fetchProcessingMovies = async () => {
    try {
      const data = await get('movie/movie/?status=d,s')
      setProcessingMovies(data)
    } catch (error) {
      console.error('error fetching movies: ', error)
    }
    setIsLoadingProcessingMovies(false)
  }

  const fetchUpcomingMovies = async () => {
    try {
      const data = await get(
        `movie/movie/?limit=${upcomingMovieCount}&status=u&order-by=release_date`,
      )
      setUpcomingMovies(data)
      setHasMoreUpcomingMovies(data.length === upcomingMovieCount)
    } catch (error) {
      console.error('error fetching movies: ', error)
    }
    setIsLoadingUpcomingMovies(false)
  }

  usePolling(fetchUpcomingEpisodes, 60000, [upcomingEpisodeCount])
  usePolling(fetchProcessingEpisodes, 30000)

  usePolling(fetchUpcomingMovies, 60000, [upcomingMovieCount])
  usePolling(fetchProcessingMovies, 30000)

  const handleLoadMoreUpcomingEpisodes = () => {
    setUpcomingEpisodeCount(upcomingEpisodeCount + 12)
  }

  const handleLoadMoreUpcomingMovies = () => {
    setUpcomingMovieCount(upcomingMovieCount + 12)
  }

  return (
    <>
      <H2>Processing</H2>
      <H3>Episodes</H3>
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
      <H3>Movies</H3>
      {isLoadingProcessingMovies ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <P>Error: {error}</P>
      ) : processingMovies?.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {processingMovies.map((movie) => (
            <MovieTile movie={movie} key={movie.id} />
          ))}
        </div>
      ) : (
        <P>No movies are processing</P>
      )}
      <H2>Upcoming</H2>
      <H3>Episodes</H3>
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
      {hasMoreUpcomingEpisodes && (
        <Button onClick={handleLoadMoreUpcomingEpisodes}>Load More</Button>
      )}
      <H3>Movies</H3>
      {isLoadingUpcomingMovies ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <P>Error: {error}</P>
      ) : upcomingMovies?.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {upcomingMovies.map((movie) => (
            <MovieTile movie={movie} key={movie.id} />
          ))}
        </div>
      ) : (
        <P>No upcoming movies found.</P>
      )}
      {hasMoreUpcomingMovies && (
        <Button onClick={handleLoadMoreUpcomingMovies}>Load More</Button>
      )}
    </>
  )
}

export default Home
