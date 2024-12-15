import { useEffect, useCallback, useState } from "react";
import useTVSeasonsStore from "../../stores/SeasonsStore";
import useSelectedSeasonStore from "../../stores/SeasonSelectedStore";
import useTVEpisodeStore from "../../stores/EpisodesStore";
import useShowDetailStore from "../../stores/ShowDetailStore";
import Episode from "../../components/Episode";
import Season from "../../components/Season";
import ShowDetail from "../../components/ShowDetail";
import useApi from "../../hooks/api";
import SeasonMetaData from "../../components/SeasonMetaData";
import { useParams } from "react-router-dom";

const TVShowDetail: React.FC = () => {
  const { id } = useParams();
  const { get } = useApi();
  const { selectedSeason, setSelectedSeason, showAllSeasons, setShowAllSeasons } = useSelectedSeasonStore();
  const { showDetail, setShowDetail } = useShowDetailStore();
  const { seasons, setSeasons } = useTVSeasonsStore();
  const { episodes, setEpisodes } = useTVEpisodeStore();
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(true);

  const fetchEpisodes = useCallback(async (seasonId: number) => {
    try {
      const data = await get(`tv/episode/?show=${id}&season=${seasonId}`);
      setEpisodes(data);
      setSelectedSeason(data.length > 0 ? data[0].season : null);
    } catch (error) {
      console.error("error fetching episodes: ", error);
    }
    setIsLoadingEpisodes(false);
  }, [id, setEpisodes, setSelectedSeason]);

  const fetchShow = useCallback(async () => {
    try {
      const data = await get(`tv/show/${id}`);
      setShowDetail(data);
    } catch (error) {
      console.error("error fetching show: ", id);
    }
  }, []);

  useEffect(() => {
    fetchShow();
  }, [id]);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const data = await get(`tv/season/?show=${id}`);
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
      const firstSeasonWithReleaseDate = seasons.find(season => season.release_date);
      if (firstSeasonWithReleaseDate) {
        fetchEpisodes(firstSeasonWithReleaseDate.id);
      }
    }
  }, [id, seasons, fetchEpisodes]);

  const handleSeasonClick = (seasonId: number) => {
    fetchEpisodes(seasonId);
  };

  const toggleShowAllSeasons = () => {
    setShowAllSeasons(!showAllSeasons);
  };

  return (
    <>
      {showDetail && (
        <ShowDetail showDetail={showDetail} fetchShow={fetchShow} />
      )}
      <div>
        <div className="season-items">
          {isLoadingSeasons ? (
            <p>Loading...</p>
          ) : Array.isArray(seasons) && seasons.length > 0 ? (
            showAllSeasons ? (
              seasons.map((season) => (
                <Season key={season.id.toString()} season={season} onClick={handleSeasonClick} />
              ))
            ) : (
              seasons.slice(0, 6).map((season) => (
                <Season key={season.id.toString()} season={season} onClick={handleSeasonClick} />
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
          <SeasonMetaData fetchEpisodes={fetchEpisodes} />
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

export default TVShowDetail;
