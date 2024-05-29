import { useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useApi from "../../hooks/api";
import ImageComponent from "../../components/ImageComponent";
import TimeComponent from "../../components/TimeComponent";
import useEpsiodeDetailStore from "../../stores/EpisodeDetailStore"

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
  }, []);

  return (
    <div>
      {episodeDetail && (
        <>
          <div className="episode-detail-header">
            <ImageComponent image={episodeDetail.image_episode} />
            <div className="episode-description">
              <h1>{episodeDetail.title}</h1>
              <Link to={`/media/tv/${episodeDetail.season.show.id}`}>
                <h2>{episodeDetail.season.show.name}</h2>
              </Link>
              <p>S{String(episodeDetail.season.number).padStart(2, '0')}E{String(episodeDetail.number).padStart(2, '0')}</p>
              <p dangerouslySetInnerHTML={{__html: episodeDetail.description}} />
              <div className="tag-group">
                {episodeDetail.release_date && <span className="tag-item">Release: <TimeComponent timestamp={episodeDetail.release_date} /></span>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
