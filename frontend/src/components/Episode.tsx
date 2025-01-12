import { Link } from 'react-router-dom'
import ImageComponent, { ImageType } from './ImageComponent'
import TimeComponent from './TimeComponent'
import { TorrentType } from './Torrent'
import { SeasonType } from './Season'

export type MediaServerMetaType = {
  width: number
  height: number
  codec: string
  fps: number
  size: number
  duration: number
  bitrate: number
}

export type EpisodeType = {
  id: number
  number: number
  image_episode?: ImageType
  status_display: string
  description: string
  status?: string
  torrent: TorrentType
  release_date: string
  title: string
  search_query: string
  media_server_meta: MediaServerMetaType
  media_server_url: string
  media_server_id: string
  season: SeasonType
}

interface EpisodeComponent {
  episode: EpisodeType
  showShow?: boolean
}

const Episode: React.FC<EpisodeComponent> = ({ episode, showShow = false }) => {
  const progress = episode.torrent?.progress
  let validatedProgress = null
  if (progress !== null && progress !== undefined) {
    validatedProgress = Math.min(100, Math.max(0, progress))
  }

  const getEpisodeImage = (episode: EpisodeType) => {
    if (episode?.image_episode) {
      if (episode.image_episode.image) {
        return episode.image_episode
      }
    }
    if (episode.season.show?.episode_fallback?.image) {
      return episode.season.show?.episode_fallback
    }
    return { image: '/episode-default.jpg' }
  }

  return (
    <div className="episode-item">
      <Link to={`/tv/episode/${episode.id}`}>
        <div className="image-wrap">
          <ImageComponent
            image={getEpisodeImage(episode)}
            alt={'episode-poster-' + episode.number}
          />
          {validatedProgress && validatedProgress > 0 && (
            <div className="progress-bar-background">
              <div
                className="progress-bar"
                style={{ width: `${validatedProgress}%` }}
              >
                <span className="smaller">{validatedProgress}%</span>
              </div>
            </div>
          )}
        </div>
      </Link>
      <div className="tile-description">
        {showShow && (
          <>
            <Link to={`tv/show/${episode.season.show.id}`}>
              {episode.season.show.name}
            </Link>
            <br />
          </>
        )}
        <span>S{String(episode.season.number).padStart(2, '0')}</span>
        <span>E{String(episode.number).padStart(2, '0')}</span>
        <span> - {episode.title}</span>
        <span className="tag-item" title={episode.status_display}>
          {episode.status || '-'}
        </span>
        <br />
        {episode.status === 'u' && (
          <TimeComponent timestamp={episode.release_date} />
        )}
      </div>
    </div>
  )
}

export default Episode
