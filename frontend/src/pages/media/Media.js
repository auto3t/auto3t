import { useEffect } from "react";
import Episode from "../../components/Episode";
import useProcessingEpisodeStore from "../../stores/processingEpisodesStore";
import useApi from "../../hooks/api";

const Media = () => {
  const { loading, error, get } = useApi();
  const { episodes, setEpisodes } = useProcessingEpisodeStore();

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const data = await get('episode/?status=d,s');
        setEpisodes(data);
      } catch (error) {
        console.error("error fetching episodes: ", error);
      }
    };

    fetchEpisodes();
  }, [setEpisodes]);

  return (
    <div className="movies">
      <h2>Processing Episodes</h2>
      <div className="episode-items">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : episodes?.length > 0 ? (
          episodes.map((episode) => (
            <Episode key={episode.id} episode={episode} />
          ))
        ) : (
          <p>No episodes are processing.</p>
        )}
      </div>
    </div>
  );
};

export default Media;
