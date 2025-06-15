import { Link } from 'react-router-dom'
import { formatBitrate, formatBytes, formatDuration } from '../utils'
import { MediaServerMetaType } from './Episode'
import { H2, P, Table } from './Typography'
import PlayIcon from './PlayIcon'

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
      <div className="grid grid-cols-2">
        <Table rows={rows} />
        <div className="flex justify-center items-center">
          <Link to={mediaServerURL} target="_blank">
            <PlayIcon />
          </Link>
        </div>
      </div>
    </>
  )
}

export default MediaServerDetail
