import { useEffect, useState } from "react";
import Episode from "../components/Episode";
import useProcessingEpisodeStore from "../stores/processingEpisodesStore";
import useUpcomingEpisodeStore from "../stores/UpcomingEpisodesStore";
import useApi from "../hooks/api";

const Home = () => {
  const { error, get } = useApi();
  const [isLoadingProcessingEpisodes, setIsLoadingProcessingEpisodes] = useState(true);
  const [isLoadingUpcomingEpisodes, setIsLoadingUpcomingEpisodes] = useState(true);
  const { processingEpisodes, setProcessingEpisodes } = useProcessingEpisodeStore();
  const { upcomingEpisodes, setUpcomingEpisodes } = useUpcomingEpisodeStore();

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const data = await get('tv/episode/?status=d,s');
        setProcessingEpisodes(data);
      } catch (error) {
        console.error("error fetching episodes: ", error);
      }
      setIsLoadingProcessingEpisodes(false);
    };

    fetchEpisodes();
  }, [setProcessingEpisodes]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const data = await get('tv/episode/?limit=12&status=u&order-by=release_date');
        setUpcomingEpisodes(data);
      } catch (error) {
        console.error("error fetching episodes: ", error);
      }
      setIsLoadingUpcomingEpisodes(false);
    };

    fetchEpisodes();
  }, [setProcessingEpisodes]);

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
          upcomingEpisodes.map((episode) => (
            <Episode key={episode.id} episode={episode} showShow={true} />
          ))
        ) : (
          <p>No upcoming episodes found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
