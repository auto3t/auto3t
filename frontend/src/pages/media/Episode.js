import { useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useApi from "../../hooks/api";
import ImageComponent from "../../components/ImageComponent";
import TimeComponent from "../../components/TimeComponent";
import useEpsiodeDetailStore from "../../stores/EpisodeDetailStore"
import EpisodeNav from "../../components/EpisodeNav";
import Torrent from "../../components/Torrent";
import TorrentSearch from "../../components/TorrentSearch";

export default function TVEpisode() {

  const { get } = useApi();
  const { id } = useParams();
  const { episodeDetail, setEpisodeDetail } = useEpsiodeDetailStore();

  const fetchEpisode = useCallback(async () => {
    try {
      const data = await get(`episode/${id}/`);
      setEpisodeDetail(data);
    } catch (error) {
      console.error("error fetching episode: ", error);
    }
  })

  useEffect(() => {
    fetchEpisode();
  }, [id]);

  const getEpisodeImage = (episode) => {
    if (episode?.image_episode) {
      if (episode.image_episode.image) {
        return episode.image_episode;
      }
    }
    return episode.season.show.episode_fallback;
  };

  return (
    <div>
      {episodeDetail && (
        <>
          <div className="episode-detail-header">
            <ImageComponent image={getEpisodeImage(episodeDetail)} />
            <div className="episode-description">
              <h1>{episodeDetail.title}</h1>
              <Link to={`/media/tv/${episodeDetail.season.show.id}`}>
                <h2>{episodeDetail.season.show.name}</h2>
              </Link>
              <p>S{String(episodeDetail.season.number).padStart(2, '0')}E{String(episodeDetail.number).padStart(2, '0')}</p>
              <p dangerouslySetInnerHTML={{__html: episodeDetail.description}} />
              <div className="tag-group">
                {episodeDetail.release_date && <span className="tag-item">Release: <TimeComponent timestamp={episodeDetail.release_date} /></span>}
                <span className="tag-item">Status: {episodeDetail.status_display}</span>
              </div>
            </div>
          </div>
          <EpisodeNav currentEpisodeId={episodeDetail.id} />
          {episodeDetail?.torrent && (
            <Torrent torrent={episodeDetail.torrent} />
          )}
          <TorrentSearch searchDefault={episodeDetail.search_query} />
        </>
      )}
    </div>
  )
}
