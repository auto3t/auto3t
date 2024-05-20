import { useEffect, useState } from "react";
import Episode from "../../components/Episode";
import useProcessingEpisodeStore from "../../stores/processingEpisodesStore";
import useApi from "../../hooks/api";

const Media = () => {
  const { error, get } = useApi();
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(true);
  const { episodes, setEpisodes } = useProcessingEpisodeStore();

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const data = await get('episode/?status=d,s');
        setEpisodes(data);
      } catch (error) {
        console.error("error fetching episodes: ", error);
      }
      setIsLoadingEpisodes(false);
    };

    fetchEpisodes();
  }, [setEpisodes]);

  return (
    <div className="movies">
      <h2>Processing Episodes</h2>
      <div className="episode-items">
        {isLoadingEpisodes ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : episodes?.length > 0 ? (
          episodes.map((episode) => (
            <Episode key={episode.id} episode={episode} showShow={true} />
          ))
        ) : (
          <p>No episodes are processing.</p>
        )}
      </div>
    </div>
  );
};

export default Media;
