import { Link } from 'react-router-dom'
import { formatBitrate, formatBytes, formatDuration } from '../utils'
import { MediaServerMetaType } from './Episode'

interface MediaServerDetailInterface {
  mediaServerDetail: MediaServerMetaType
  mediaServerURL: string
}

const MediaServerDetail: React.FC<MediaServerDetailInterface> = ({
  mediaServerDetail,
  mediaServerURL,
}) => {
  return (
    <>
      <h2>File Meta Data</h2>
      <table>
        <tbody>
          <tr>
            <td>Codec</td>
            <td>{mediaServerDetail.codec}</td>
          </tr>
          <tr>
            <td>Width</td>
            <td>{mediaServerDetail.width}</td>
          </tr>
          <tr>
            <td>Height</td>
            <td>{mediaServerDetail.height}</td>
          </tr>
          <tr>
            <td>Duration</td>
            <td>{formatDuration(mediaServerDetail.duration)}</td>
          </tr>
          <tr>
            <td>Size</td>
            <td>{formatBytes(mediaServerDetail.size)}</td>
          </tr>
          <tr>
            <td>Bitrate</td>
            <td>{formatBitrate(mediaServerDetail.bitrate)}</td>
          </tr>
          <tr>
            <td>FPS</td>
            <td>{mediaServerDetail.fps.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <Link to={mediaServerURL} target="_blank">
        Open
      </Link>
    </>
  )
}

export default MediaServerDetail
