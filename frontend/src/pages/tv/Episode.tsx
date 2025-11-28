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
import {
  H1,
  H2,
  LucideIconWrapper,
  P,
  Select,
  TagItem,
} from '../../components/Typography'
import { formatDuration } from '../../utils'

const TVEpisode: React.FC = () => {
  const { id } = useParams()
  const { get, patch } = useApi()
  const [episodeRefresh, setEpisodeRefresh] = useState(false)
  const [editEpisodeStatus, setEditEpisodeStatus] = useState(false)

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

  const handleEpisodeStatusUpdate = async (status: string) => {
    try {
      const data = await patch(`tv/episode/${id}/`, { status })
      setEpisodeDetail(data)
      setEditEpisodeStatus(false)
    } catch (error) {
      console.error('error updating status: ', error)
    }
  }

  return (
    <div className="mb-10">
      {episodeDetail && (
        <>
          <title>{`A3T | ${episodeDetail.title}`}</title>
          <div className="md:w-[75%] mx-auto py-6">
            {episodeImage && (
              <ImageComponent image={episodeImage} alt="episode-poster" />
            )}
          </div>
          <div className="flex gap-4 justify-center items-baseline flex-wrap py-4">
            <Link to={`/tv/show/${episodeDetail.season.show.id}`}>
              <H2>{episodeDetail.season.show.name}</H2>
            </Link>
            <P variant="larger">:</P>
            <H1>{episodeDetail.title}</H1>
          </div>
          <div className="text-center">
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
                {editEpisodeStatus ? (
                  <span className="flex gap-2 items-center">
                    <Select
                      defaultValue={episodeDetail.status}
                      onChange={(e) =>
                        handleEpisodeStatusUpdate(e.target.value)
                      }
                    >
                      <option value="u">Upcoming</option>
                      <option value="s">Searching</option>
                      <option value="d">Downloading</option>
                      <option value="f">Finished</option>
                      <option value="a">Archived</option>
                      <option value="i">Ignored</option>
                    </Select>
                    <LucideIconWrapper
                      name="X"
                      onClick={() => setEditEpisodeStatus(false)}
                      className="cursor-pointer bg-main-fg rounded-lg p-2"
                    />
                  </span>
                ) : (
                  <span className="flex items-center gap-4">
                    Status: {episodeDetail.status_display || 'undefined'}
                    <LucideIconWrapper
                      name="Pencil"
                      className="cursor-pointer bg-main-fg rounded-lg p-2"
                      onClick={() => setEditEpisodeStatus(true)}
                    />
                  </span>
                )}
              </TagItem>
            </div>
          </div>
          <EpisodeNav currentEpisodeId={episodeDetail.id} />
          {episodeDetail.torrent.length > 0 && (
            <>
              <H2>Releases</H2>
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
            setRefresh={setEpisodeRefresh}
          />
        </>
      )}
    </div>
  )
}

export default TVEpisode
