import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useTVSeasonsStore from "../../stores/SeasonsStore";
import useTVEpisodeStore from "../../stores/EpisodesStore";

export default function TVShowDetail() {
  const { id } = useParams();
  const { seasons, setSeasons } = useTVSeasonsStore();
  const { episodes, setEpisodes } = useTVEpisodeStore();

  const fetchEpisodes = async (seasonId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/episode/?show=${id}&season=${seasonId}`);
      const data = await res.json();
      setEpisodes(data.results);
    } catch (error) {
      console.error("error fetching episodes: ", error);
    }
  };

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
      // Fetch episodes for the first season initially
      fetchEpisodes(seasons[0].id);
    }
  }, [id, seasons]);

  const handleSeasonClick = (seasonId) => {
    // Fetch episodes for the clicked season
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
          <div key={season.id} onClick={() => handleSeasonClick(season.id)}>
            <p>Season: {season.number}</p>
          </div>
        ))}
      </div>
      <div>
        <h3>Episodes</h3>
        {episodes.map((episode) => (
          <div key={episode.id}>
            <p>Episode: {episode.title}</p>
          </div>
        ))}
      </div>
    </>
  );
}
