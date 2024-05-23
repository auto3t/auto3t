import { Link } from "react-router-dom";
import ImageComponent from "./ImageComponent";
import TimeComponent from "./TimeComponent";

const Episode = ({ episode, showShow = false }) => {
  return (
    <div className="episode-item">
      <ImageComponent image={episode?.image_episode || episode.season.show.episode_fallback} alt={'episode-poster-' + episode.number} />
      <p>
        {showShow && (<><Link to={`tv/${episode.season.show.id}`}>{episode.season.show.name}</Link><span> - </span></>)}
        <span>S{String(episode.season.number).padStart(2, '0')}</span>
        <span>E{String(episode.number).padStart(2, '0')}</span>
        <span> - {episode.title}</span>
        <span className="tag-item" title={episode.status_display}>{episode.status || '-'}</span>
        { episode.torrent?.progress > 0 && (<span>[{episode.torrent.progress}%]</span>)}
        <br />{ episode.status === 'u' && (<TimeComponent timestamp={episode.release_date} />)}
      </p>
    </div>
  );
};

export default Episode;
