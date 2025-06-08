import useTVEpisodeStore from '../stores/EpisodesStore'
import { formatBitrate, formatBytes } from '../utils'
import { H3, Table } from './Typography'

const SeasonEpisodeSummary = () => {
  const { episodes } = useTVEpisodeStore()

  const rows = episodes.map((episode) => [
    episode.number.toString(),
    episode.media_server_meta ? (
      <>
        {episode.media_server_meta?.width}x{episode.media_server_meta?.height}
      </>
    ) : (
      ''
    ),
    episode.media_server_meta?.codec,
    episode.media_server_meta?.bitrate
      ? formatBitrate(episode.media_server_meta?.bitrate)
      : '',
    episode.media_server_meta?.size
      ? formatBytes(episode.media_server_meta?.size)
      : '',
  ])

  return (
    <>
      {episodes && (
        <>
          <H3>Episode Overview</H3>
          <Table
            headers={['Episode', 'Resolution', 'Codec', 'Bitrate', 'Size']}
            rows={rows}
          />
        </>
      )}
    </>
  )
}

export default SeasonEpisodeSummary
