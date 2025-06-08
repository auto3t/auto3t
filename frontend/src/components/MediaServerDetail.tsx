import { Link } from 'react-router-dom'
import { formatBitrate, formatBytes, formatDuration } from '../utils'
import { MediaServerMetaType } from './Episode'
import { Button, H2, Table } from './Typography'

interface MediaServerDetailInterface {
  mediaServerDetail: MediaServerMetaType
  mediaServerURL: string
}

const MediaServerDetail: React.FC<MediaServerDetailInterface> = ({
  mediaServerDetail,
  mediaServerURL,
}) => {
  const rows = [
    ['Codec', mediaServerDetail.codec],
    ['Width', mediaServerDetail.width],
    ['Height', mediaServerDetail.height],
    ['Duration', formatDuration(mediaServerDetail.duration)],
    ['Size', formatBytes(mediaServerDetail.size)],
    ['Bitrate', formatBitrate(mediaServerDetail.bitrate)],
    ['FPS', mediaServerDetail.fps.toFixed(2)],
  ]

  return (
    <>
      <H2>File Meta Data</H2>
      <Table rows={rows} />
      <Link to={mediaServerURL} target="_blank">
        <Button>Open</Button>
      </Link>
    </>
  )
}

export default MediaServerDetail
