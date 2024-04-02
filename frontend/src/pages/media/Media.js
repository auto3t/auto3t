import { useCallback, useEffect } from "react";
import Episode from "../../components/Episode";
import useTVEpisodeStore from "../../stores/EpisodesStore";

const Media = () => {

  const { episodes, setEpisodes } = useTVEpisodeStore();

  const fetchEpisodes = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/episode/?status=d,s');
      const data = await res.json();
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
          <p>No episodes in season.</p>
        )}
      </div>
    </div>
  )
}

export default Media;
