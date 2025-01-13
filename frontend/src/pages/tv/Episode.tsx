import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useApi from '../../hooks/api'
import ImageComponent from '../../components/ImageComponent'
import TimeComponent from '../../components/TimeComponent'
import useEpsiodeDetailStore from '../../stores/EpisodeDetailStore'
import EpisodeNav from '../../components/EpisodeNav'
import Torrent from '../../components/Torrent'
import ManualSearch from '../../components/ManualSearch'
import { EpisodeType } from '../../components/Episode'
import MediaServerDetail from '../../components/MediaServerDetail'

const TVEpisode: React.FC = () => {
  const { id } = useParams()
  const { get } = useApi()
  const [episodeRefresh, setEpisodeRefresh] = useState(false)

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
  }, [id, episodeRefresh])

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
          {episodeDetail.torrent.length > 0 && (
            <>
              <h2>Torrents</h2>
              {episodeDetail.torrent?.map((torrent) => (
                <Torrent
                  key={torrent.id}
                  torrent={torrent}
                  setRefresh={setEpisodeRefresh}
                />
              ))}
            </>
          )}
          {episodeDetail?.media_server_id && (
            <MediaServerDetail
              mediaServerDetail={episodeDetail.media_server_meta}
              mediaServerURL={episodeDetail.media_server_url}
            />
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
