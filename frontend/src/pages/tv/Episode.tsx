import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useApi from '../../hooks/api'
import ImageComponent from '../../components/ImageComponent'
import TimeComponent from '../../components/TimeComponent'
import useEpsiodeDetailStore from '../../stores/EpisodeDetailStore'
import EpisodeNav from '../../components/tv/EpisodeNav'
import Torrent from '../../components/Torrent'
import ManualSearch from '../../components/ManualSearch'
import { EpisodeType } from '../../components/tv/Episode'
import MediaServerDetail from '../../components/MediaServerDetail'
import episodeLogoDefault from '../../../assets/episode-default.jpg'
import { H1, H2, P, TagItem } from '../../components/Typography'
import { formatDuration } from '../../utils'

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
      return { image: episodeLogoDefault }
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
    <div className="mb-10">
      {episodeDetail && (
        <>
          <div className="w-[75%] mx-auto py-6">
            {episodeImage && (
              <ImageComponent image={episodeImage} alt="episode-poster" />
            )}
          </div>
          <div className="text-center py-4">
            <H1>{episodeDetail.title}</H1>
            <Link to={`/tv/show/${episodeDetail.season.show.id}`}>
              <H2>{episodeDetail.season.show.name}</H2>
            </Link>
            <P>
              S{String(episodeDetail.season.number).padStart(2, '0')}E
              {String(episodeDetail.number).padStart(2, '0')}
            </P>
            <P
              dangerouslySetInnerHTML={{ __html: episodeDetail.description }}
            />
            <div className="flex gap-2 justify-center py-4">
              {episodeDetail.runtime && (
                <TagItem>
                  {`Runtime: ${formatDuration(episodeDetail.runtime * 60)}`}
                </TagItem>
              )}
              {episodeDetail.release_date && (
                <TagItem>
                  Release:{' '}
                  <TimeComponent timestamp={episodeDetail.release_date} />
                </TagItem>
              )}
              <TagItem>
                Status: {episodeDetail.status_display || 'undefined'}
              </TagItem>
            </div>
          </div>
          <EpisodeNav currentEpisodeId={episodeDetail.id} />
          {episodeDetail.torrent.length > 0 && (
            <>
              <H2>Torrents</H2>
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
            <div className="py-6">
              <MediaServerDetail
                mediaServerDetail={episodeDetail.media_server_meta}
                mediaServerURL={episodeDetail.media_server_url}
              />
            </div>
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
