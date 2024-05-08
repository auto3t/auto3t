import { useEffect, useRef } from "react";
import Episode from "../../components/Episode";
import useProcessingEpisodeStore from "../../stores/processingEpisodesStore";
import useApi from "../../hooks/api";

const Media = () => {
  const { loading, get } = useApi();
  const { episodes, setEpisodes } = useProcessingEpisodeStore();

  const fetchEpisodesRef = useRef();

  fetchEpisodesRef.current = async () => {
    try {
      const data = await get('episode/?status=d,s');
      setEpisodes(data);
    } catch (error) {
      console.error("error fetching episodes: ", error);
    }
  };

  useEffect(() => {
    const fetchEpisodes = async () => {
      await fetchEpisodesRef.current();
    };
    
    fetchEpisodes();
  }, []);

  return (
    <div className="movies">
      <h2>Processing Episodes</h2>
      <div className="episode-items">
        {loading ? (
          <p>Loading...</p>
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
