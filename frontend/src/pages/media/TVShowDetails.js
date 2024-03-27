import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import useTVSeasonsStore from "../../stores/SeasonsStore";
import useTVEpisodeStore from "../../stores/EpisodesStore";
import Episode from "../../components/Episode";
import Season from "../../components/Season";

export default function TVShowDetail() {
  const { id } = useParams();
  const { seasons, setSeasons } = useTVSeasonsStore();
  const { episodes, setEpisodes } = useTVEpisodeStore();

  const fetchEpisodes = useCallback(async (seasonId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/episode/?show=${id}&season=${seasonId}`);
      const data = await res.json();
      setEpisodes(data.results);
    } catch (error) {
      console.error("error fetching episodes: ", error);
    }
  }, [id, setEpisodes]);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/season/?show=${id}`);
        const data = await res.json();
        setSeasons(data.results);
      } catch (error) {
        console.error("error fetching seasons: ", error);
      }
    };
    fetchSeasons();
  }, [id, setSeasons]);

  useEffect(() => {
    if (seasons.length > 0) {
      fetchEpisodes(seasons[0].id);
    }
  }, [id, seasons, fetchEpisodes]);

  const handleSeasonClick = (seasonId) => {
    fetchEpisodes(seasonId);
  };

  return (
    <>
      <div className="tvshow-detail">
        <h2>Show Details</h2>
        <p>Show ID: {id}</p>
      </div>
      <div>
        <h3>Seasons</h3>
        {seasons.map((season) => (
          <Season key={season.id} season={season} onClick={handleSeasonClick} />
        ))}
      </div>
      <div>
        <h3>Episodes</h3>
        {episodes.map((episode) => (
          <div key={episode.id}>
            <Episode key={episode.id} episode={episode} />
          </div>
        ))}
      </div>
    </>
  );
}
