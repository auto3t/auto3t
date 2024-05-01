import { useEffect, useCallback, useState } from "react";
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
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(true);

  const fetchEpisodes = useCallback(async (seasonId) => {
    try {
      const data = await get(`episode/?show=${id}&season=${seasonId}`);
      setEpisodes(data);
      setSelectedSeason(data.length > 0 ? data[0].season : null);
    } catch (error) {
      console.error("error fetching episodes: ", error);
    }
    setIsLoadingEpisodes(false);
  }, [id, setEpisodes, setSelectedSeason]);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const data = await get(`season/?show=${id}`);
        setShowDetail(data.length > 0 ? data[0].show : null);
        setSeasons(data);
      } catch (error) {
        console.error("error fetching seasons: ", error);
      }
      setIsLoadingSeasons(false);
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
          {isLoadingSeasons ? (
            <p>Loading...</p>
          ) : Array.isArray(seasons) && seasons.length > 0 ? (
            showAllSeasons ? (
              seasons.map((season) => (
                <Season key={season.id} season={season} onClick={handleSeasonClick} />
              ))
            ) : (
              seasons.slice(0, 6).map((season) => (
                <Season key={season.id} season={season} onClick={handleSeasonClick} />
              ))
            )
          ) : (
            <p>No Seasons found.</p>
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
            {isLoadingEpisodes ? (
              <p>Loading...</p>
            ) : episodes?.length > 0 ? (
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
