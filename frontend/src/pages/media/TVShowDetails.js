import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import useTVSeasonsStore from "../../stores/SeasonsStore";
import useSelectedSeasonStore from "../../stores/SeasonSelectedStore";
import useTVEpisodeStore from "../../stores/EpisodesStore";
import useShowDetailStore from "../../stores/ShowDetailStore";
import Episode from "../../components/Episode";
import BulkUpdateEpisodes from "../../components/EpisodeBulkUpdate";
import Season from "../../components/Season";

export default function TVShowDetail() {
  const { id } = useParams();
  const { selectedSeason, setSelectedSeason } = useSelectedSeasonStore();
  const { showDetail, setShowDetail } = useShowDetailStore();
  const { seasons, setSeasons } = useTVSeasonsStore();
  const { episodes, setEpisodes } = useTVEpisodeStore();

  const fetchEpisodes = useCallback(async (seasonId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/episode/?show=${id}&season=${seasonId}`);
      const data = await res.json();
      setEpisodes(data.results);
      setSelectedSeason(data.results.length > 0 ? data.results[0].season : null);
    } catch (error) {
      console.error("error fetching episodes: ", error);
    }
  }, [id, setEpisodes, setSelectedSeason]);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/season/?show=${id}`);
        const data = await res.json();
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

  return (
    <>
      {showDetail && (
        <div className="show-detail">
          <div className="show-poster">
            <img src={showDetail.image} alt="show-poster" />
          </div>
          <div className="show-description">
            <h1>{showDetail.name}</h1>
            <span className='smaller'>ID: {showDetail.remote_server_id}</span>
            <p dangerouslySetInnerHTML={{__html: showDetail.description}} />
          </div>
        </div>
      )}
      <div>
        <h3>Seasons</h3>
        <div className="season-items">
          {seasons.length > 0 ? (
            seasons.map((season) => (
              <Season key={season.id} season={season} onClick={handleSeasonClick} />
            ))
          ) : (
            <p>Show doesn't have any seasons.</p>
          )}
        </div>
      </div>
      {selectedSeason && (
        <div>
          <h3>Episodes Season {selectedSeason.number}</h3>
          <BulkUpdateEpisodes seasonId={selectedSeason.id} fetchEpisodes={fetchEpisodes}/>
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
      )}
    </>
  );
}
