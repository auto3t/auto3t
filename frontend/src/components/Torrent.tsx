import { useState } from 'react'
import useApi from '../hooks/api'
import { Button, P, TagItem } from './Typography'

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
    <div className="p-4 my-4 border border-accent-1">
      <div className="flex gap-2">
        <TagItem>Type: {torrent.torrent_type_display}</TagItem>
        <TagItem>State: {torrent.torrent_state_display}</TagItem>
      </div>
      {validatedProgress && validatedProgress > 0 && (
        <div className="relative h-10">
          <div className="absolute w-full bg-accent-1 bottom-0">
            <div
              className="text-center bg-accent-2 text-main-fg"
              style={{ width: `${validatedProgress}%` }}
            >
              <span>{validatedProgress}%</span>
            </div>
          </div>
        </div>
      )}
      <div className="pt-4">
        <P className="bg-accent-3 p-2 mb-2 break-words">
          {isExpanded ? torrent.magnet : torrent.magnet_hash}
        </P>
        <Button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Show Hash' : 'Show Magnet'}
        </Button>
        {torrent.torrent_state === 'i' && (
          <>
            <Button onClick={() => setDeleteConfirm(true)}>Delete</Button>
            {deleteConfirm && (
              <>
                <Button onClick={handleDelete}>Confirm</Button>
                <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Torrent
