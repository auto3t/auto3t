import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import useTVSeasonsStore from "../../stores/SeasonsStore";
import useSelectedSeasonStore from "../../stores/SeasonSelectedStore";
import useTVEpisodeStore from "../../stores/EpisodesStore";
import useShowDetailStore from "../../stores/ShowDetailStore";
import Episode from "../../components/Episode";
import BulkUpdateEpisodes from "../../components/EpisodeBulkUpdate";
import Season from "../../components/Season";
import ShowDetail from "../../components/ShowDetail";
import { get } from "../../api";

export default function TVShowDetail() {
  const { id } = useParams();
  const { selectedSeason, setSelectedSeason, showAllSeasons, setShowAllSeasons } = useSelectedSeasonStore();
  const { showDetail, setShowDetail } = useShowDetailStore();
  const { seasons, setSeasons } = useTVSeasonsStore();
  const { episodes, setEpisodes } = useTVEpisodeStore();

  const fetchEpisodes = useCallback(async (seasonId) => {
    try {
      const data = await get(`episode/?show=${id}&season=${seasonId}`);
      setEpisodes(data.results);
      setSelectedSeason(data.results.length > 0 ? data.results[0].season : null);
    } catch (error) {
      console.error("error fetching episodes: ", error);
    }
  }, [id, setEpisodes, setSelectedSeason]);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const data = await get(`season/?show=${id}`);
        setShowDetail(data.results.length > 0 ? data.results[0].show : null);
        setSeasons(data.results);
      } catch (error) {
        console.error("error fetching seasons: ", error);
      }
    };
    fetchSeasons();
  }, [id, setSeasons, setShowDetail]);

  useEffect(() => {
    if (seasons.length > 0) {
      fetchEpisodes(seasons[0].id);
    }
  }, [id, seasons, fetchEpisodes]);

  const handleSeasonClick = (seasonId) => {
    fetchEpisodes(seasonId);
  };

  const toggleShowAllSeasons = () => {
    setShowAllSeasons(!showAllSeasons);
  };

  return (
    <>
      {showDetail && (
        <ShowDetail showDetail={showDetail} setShowDetail={setShowDetail} />
      )}
      <div>
        <h3>Seasons</h3>
        <div className="season-items">
          {showAllSeasons ? (
            seasons.map((season) => (
              <Season key={season.id} season={season} onClick={handleSeasonClick} />
            ))
          ) : (
            seasons.slice(0, 6).map((season) => (
              <Season key={season.id} season={season} onClick={handleSeasonClick} />
            ))
          )}
        </div>
        {seasons.length > 6 && (
          <button onClick={toggleShowAllSeasons}>
            {showAllSeasons ? "Show Less" : "Show More"}
          </button>
        )}
      </div>
      {selectedSeason && (
        <div>
          <h3>Episodes Season {selectedSeason.number}</h3>
          <BulkUpdateEpisodes seasonId={selectedSeason.id} fetchEpisodes={fetchEpisodes}/>
          <div className="episode-items">
            {episodes?.length > 0 ? (
              episodes.map((episode) => (
                <Episode key={episode.id} episode={episode} />
              ))
            ) : (
              <p>No episodes in season.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
