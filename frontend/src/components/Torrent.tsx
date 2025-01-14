import { useState } from 'react'
import useApi from '../hooks/api'

export type TorrentType = {
  id: number
  torrent_type_display: string
  torrent_state_display: string
  magnet: string
  magnet_hash: string
  torrent_type: string
  torrent_state: string
  progress?: number
}

interface TorrentInterface {
  torrent: TorrentType
  setRefresh: (arg0: boolean) => void
}

const Torrent: React.FC<TorrentInterface> = ({ torrent, setRefresh }) => {
  const { del } = useApi()
  const [isExpanded, setIsExpanded] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    try {
      await del(`torrent/${torrent.id}/`)
      setRefresh(true)
    } catch {
      console.error('failed to delete torrent')
    }
  }

  const progress = torrent?.progress
  let validatedProgress = null
  if (progress !== null && progress !== undefined) {
    validatedProgress = Math.min(100, Math.max(0, progress))
  }

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
          {isExpanded ? torrent.magnet : torrent.magnet_hash}
        </p>
        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Show hash' : 'Show Magnet'}
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
