import { useCallback, useEffect } from "react";
import Episode from "../../components/Episode";
import useTVEpisodeStore from "../../stores/EpisodesStore";
import { get } from "../../api";

const Media = () => {

  const { episodes, setEpisodes } = useTVEpisodeStore();

  const fetchEpisodes = useCallback(async () => {
    try {
      const data = await get('episode/?status=d,s');
      setEpisodes(data.results);
    } catch (error) {
      console.error("error fetching episodes: ", error);
    }
  }, [setEpisodes]);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  return (
    <div className="movies">
      <h2>Processing Episodes</h2>
      <div className="episode-items">
        {episodes.length > 0 ? (
          episodes.map((episode) => (
            <Episode key={episode.id} episode={episode} />
          ))
        ) : (
          <p>No episodes are processing.</p>
        )}
      </div>
    </div>
  )
}

export default Media;
