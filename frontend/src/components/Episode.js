import { Link } from "react-router-dom";
import ImageComponent from "./ImageComponent";
import TimeComponent from "./TimeComponent";

const Episode = ({ episode, showShow = false }) => {

  const progress = episode.torrent?.progress;
  let validatedProgress = null;
  if (progress !== null && progress !== undefined) {
    validatedProgress = Math.min(100, Math.max(0, progress));
  }

  const getEpisodeImage = (episode) => {
    if (episode?.image_episode) {
      if (episode.image_episode.image) {
        return episode.image_episode;
      }
    }
    return episode.season.show.episode_fallback;
  };

  return (
    <div className="episode-item">
      <Link to={`/media/episode/${episode.id}`}>
        <div className='image-wrap'>
          <ImageComponent image={getEpisodeImage(episode)} alt={'episode-poster-' + episode.number} />
          { validatedProgress && (
            <div className="progress-bar-background">
              <div className="progress-bar" style={{ width: `${validatedProgress}%` }}>
                <span className="smaller">{ validatedProgress }%</span>
              </div>
            </div>
          )}
        </div>
      </Link>
      <div className="tile-description">
        {showShow && (<><Link to={`tv/${episode.season.show.id}`}>{episode.season.show.name}</Link><br/></>)}
        <span>S{String(episode.season.number).padStart(2, '0')}</span>
        <span>E{String(episode.number).padStart(2, '0')}</span>
        <span> - {episode.title}</span>
        <span className="tag-item" title={episode.status_display}>{episode.status || '-'}</span>
        <br />{ episode.status === 'u' && (<TimeComponent timestamp={episode.release_date} />)}
      </div>
    </div>
  );
};

export default Episode;
