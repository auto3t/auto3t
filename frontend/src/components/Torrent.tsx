import { useState } from 'react'
import useApi from '../hooks/api'

export type TorrentType = {
  id: number
  torrent_type_display: string
  torrent_state_display: string
  magnet: string
  torrent_type: string
  torrent_state: string
  progress?: number
}

interface TorrentInterface {
  torrent: TorrentType
  setMovieRefresh: (arg0: boolean) => void
}

const Torrent: React.FC<TorrentInterface> = ({ torrent, setMovieRefresh }) => {
  const { del } = useApi()
  const [isExpanded, setIsExpanded] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
  }

  const handleDelete = async () => {
    try {
      await del(`torrent/${torrent.id}/`)
      setMovieRefresh(true)
    } catch {
      console.error('failed to delete torrent')
    }
  }

  const progress = torrent?.progress
  let validatedProgress = null
  if (progress !== null && progress !== undefined) {
    validatedProgress = Math.min(100, Math.max(0, progress))
  }

  const displayMagnet = isExpanded
    ? torrent.magnet
    : torrent.magnet.slice(0, 60)

  return (
    <div className="torrent-detail">
      <div className="tag-group">
        <span className="tag-item">Type: {torrent.torrent_type_display}</span>
        <span className="tag-item">State: {torrent.torrent_state_display}</span>
      </div>
      {validatedProgress && validatedProgress > 0 && (
        <div className="progress-wrap">
          <div className="progress-bar-background">
            <div
              className="progress-bar"
              style={{ width: `${validatedProgress}%` }}
            >
              <span className="smaller">{validatedProgress}%</span>
            </div>
          </div>
        </div>
      )}
      <div>
        <p className="text-blob">
          {displayMagnet}
          {!isExpanded && '...'}
        </p>
        <button onClick={toggleExpansion}>
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
        {torrent.torrent_state === 'i' && (
          <>
            <button onClick={() => setDeleteConfirm(true)}>Delete</button>
            {deleteConfirm && (
              <>
                <button onClick={handleDelete}>Confirm</button>
                <button onClick={() => setDeleteConfirm(false)}>Cancel</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Torrent
