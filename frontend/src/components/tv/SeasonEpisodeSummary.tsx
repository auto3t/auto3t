import useTVEpisodeStore from '../../stores/EpisodesStore'
import { formatBitrate, formatBytes, formatResolution } from '../../utils'
import { H3, Table } from '../Typography'

const SeasonEpisodeSummary = () => {
  const { episodes } = useTVEpisodeStore()

  let rows: string[][] = []

  episodes.map((episode) => {
    const row: Array<string> = []

    row.push(episode.number.toString())
    row.push(episode.number_offset_overwrite?.toString() || '')
    row.push(episode.imdb_rating ? `${episode.imdb_rating}/10` : '')
    row.push(
      formatResolution(
        episode.media_server_meta?.width,
        episode.media_server_meta?.height,
      ),
    )
    row.push(episode.media_server_meta?.codec || '')
    row.push(formatBitrate(episode.media_server_meta?.bitrate))
    row.push(formatBytes(episode.media_server_meta?.size))

    rows.push(row)
  })

  const headers = [
    'Episode',
    'Offset',
    'IMDb',
    'Resolution',
    'Codec',
    'Bitrate',
    'Size',
  ]

  const hasOffset = rows.some((row) => row[1] !== '')
  const hasRatings = rows.some((row) => row[2] !== '')
  const columnsToRemove: number[] = []

  if (!hasRatings) columnsToRemove.push(2)
  if (!hasOffset) columnsToRemove.push(1)

  if (columnsToRemove.length > 0) {
    rows = rows.map((row) =>
      row.filter((_, colIndex) => !columnsToRemove.includes(colIndex)),
    )
  }
  if (!hasRatings) headers.splice(2, 1)
  if (!hasOffset) headers.splice(1, 1)

  return (
    <>
      {episodes && (
        <>
          <H3>Episode Overview</H3>
          <Table headers={headers} rows={rows} />
        </>
      )}
    </>
  )
}

export default SeasonEpisodeSummary
