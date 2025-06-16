import { Link } from 'react-router-dom'
import ImageComponent, { ImageType } from './ImageComponent'
import TimeComponent from './TimeComponent'
import { TorrentType } from './Torrent'
import { SeasonType } from './Season'
import ProgressBar from './ProgressBar'
import episodeLogoDefault from '../../assets/episode-default.jpg'
import { P, StyledLink, TagItem } from './Typography'

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
  runtime: number | null
  status?: string
  torrent: TorrentType[]
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
  const getEpisodeImage = (episode: EpisodeType) => {
    if (episode?.image_episode) {
      if (episode.image_episode.image) {
        return episode.image_episode
      }
    }
    if (episode.season.show?.episode_fallback?.image) {
      return episode.season.show?.episode_fallback
    }
    return { image: episodeLogoDefault }
  }

  return (
    <div>
      <Link to={`/tv/episode/${episode.id}`}>
        <div className="relative">
          <ImageComponent
            image={getEpisodeImage(episode)}
            alt={'episode-poster-' + episode.number}
          />
          <TagItem
            title={episode.status_display}
            className="absolute top-0 right-0 m-4"
          >
            {episode.status || '-'}
          </TagItem>
          <ProgressBar torrents={episode?.torrent} />
        </div>
      </Link>
      <div className="text-center p-2">
        {showShow && (
          <>
            <StyledLink to={`tv/show/${episode.season.show.id}`}>
              {episode.season.show.name}
            </StyledLink>
          </>
        )}
        <P>
          <span>S{String(episode.season.number).padStart(2, '0')}</span>
          <span>E{String(episode.number).padStart(2, '0')}</span>
          <span> - {episode.title}</span>
        </P>

        {episode.status === 'u' && (
          <P>
            <TimeComponent timestamp={episode.release_date} />
          </P>
        )}
      </div>
    </div>
  )
}

export default Episode
