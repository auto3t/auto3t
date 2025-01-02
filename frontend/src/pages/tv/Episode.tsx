import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import useApi from '../../hooks/api'
import ImageComponent from '../../components/ImageComponent'
import TimeComponent from '../../components/TimeComponent'
import useEpsiodeDetailStore from '../../stores/EpisodeDetailStore'
import EpisodeNav from '../../components/EpisodeNav'
import Torrent from '../../components/Torrent'
import ManualSearch from '../../components/ManualSearch'
import { formatBitrate, formatBytes, formatDuration } from '../../utils'
import { EpisodeType } from '../../components/Episode'

const TVEpisode: React.FC = () => {
  const { id } = useParams()
  const { get } = useApi()

  const { episodeDetail, setEpisodeDetail, episodeImage, setEpisodeImage } =
    useEpsiodeDetailStore()

  useEffect(() => {
    const getEpisodeImage = (data: EpisodeType) => {
      if (data.image_episode?.image) return data.image_episode
      if (data.season.show.episode_fallback?.image)
        return data.season.show.episode_fallback
      return { image: '/episode-default.jpg' }
    }
    const fetchEpisode = async () => {
      try {
        const data = await get(`tv/episode/${id}/`)
        setEpisodeDetail(data)
        setEpisodeImage(getEpisodeImage(data))
      } catch (error) {
        console.error('error fetching episode: ', error)
      }
    }
    fetchEpisode()
  }, [id])

  return (
    <div>
      {episodeDetail && (
        <>
          <div className="episode-detail-header">
            {episodeImage && (
              <ImageComponent image={episodeImage} alt="episode-poster" />
            )}
            <div className="episode-description">
              <h1>{episodeDetail.title}</h1>
              <Link to={`/tv/show/${episodeDetail.season.show.id}`}>
                <h2>{episodeDetail.season.show.name}</h2>
              </Link>
              <p>
                S{String(episodeDetail.season.number).padStart(2, '0')}E
                {String(episodeDetail.number).padStart(2, '0')}
              </p>
              <p
                dangerouslySetInnerHTML={{ __html: episodeDetail.description }}
              />
              <div className="tag-group">
                {episodeDetail.release_date && (
                  <span className="tag-item">
                    Release:{' '}
                    <TimeComponent timestamp={episodeDetail.release_date} />
                  </span>
                )}
                <span className="tag-item">
                  Status: {episodeDetail.status_display || 'undefined'}
                </span>
              </div>
            </div>
          </div>
          <EpisodeNav currentEpisodeId={episodeDetail.id} />
          {episodeDetail?.torrent && (
            <Torrent torrent={episodeDetail.torrent} />
          )}
          {episodeDetail?.media_server_id && (
            <>
              <h2>File Meta Data</h2>
              <table>
                <tbody>
                  <tr>
                    <td>Codec</td>
                    <td>{episodeDetail.media_server_meta.codec}</td>
                  </tr>
                  <tr>
                    <td>Width</td>
                    <td>{episodeDetail.media_server_meta.width}</td>
                  </tr>
                  <tr>
                    <td>Height</td>
                    <td>{episodeDetail.media_server_meta.height}</td>
                  </tr>
                  <tr>
                    <td>Duration</td>
                    <td>
                      {formatDuration(episodeDetail.media_server_meta.duration)}
                    </td>
                  </tr>
                  <tr>
                    <td>Size</td>
                    <td>{formatBytes(episodeDetail.media_server_meta.size)}</td>
                  </tr>
                  <tr>
                    <td>Bitrate</td>
                    <td>
                      {formatBitrate(episodeDetail.media_server_meta.bitrate)}
                    </td>
                  </tr>
                  <tr>
                    <td>FPS</td>
                    <td>{episodeDetail.media_server_meta.fps.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <Link to={episodeDetail.media_server_url} target="_blank">
                Open
              </Link>
            </>
          )}
          <ManualSearch
            searchType="episode"
            searchTypeId={episodeDetail.id}
            searchDefault={episodeDetail.search_query}
          />
        </>
      )}
    </div>
  )
}

export default TVEpisode
