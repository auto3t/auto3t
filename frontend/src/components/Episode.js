import { Link } from "react-router-dom";
import ImageComponent from "./ImageComponent";
import TimeComponent from "./TimeComponent";

const Episode = ({ episode, showShow = false }) => {
  return (
    <div className="episode-item">
      {episode.image ? (
        <ImageComponent imagePath={episode.image} imageBlur={episode.image_blur} alt={'episode-poster-' + episode.number} />
      ) : (
        <img src="/episode-default.jpg" alt="episode image placeholder" />
      )}
      <p>
        {showShow && (<Link to={`tv/${episode.season.show.id}`}>{episode.season.show.name} </Link>)}
        <span>S{String(episode.season.number).padStart(2, '0')}</span>
        <span>E{String(episode.number).padStart(2, '0')}</span>
        <span> - {episode.title}</span>
        <span> [{episode.status || '-'}]</span>
        { episode.torrent?.progress > 0 && (<span>[{episode.torrent.progress}%]</span>)}
        <br />{ episode.status === 'u' && (<TimeComponent timestamp={episode.release_date} />)}
      </p>
    </div>
  );
};

export default Episode;
