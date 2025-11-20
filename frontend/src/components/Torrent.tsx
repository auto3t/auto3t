import { useState } from 'react'
import useApi from '../hooks/api'
import { Button, LucideIconWrapper, P, TagItem } from './Typography'

export type TorrentType = {
  id: number
  torrent_type_display: string
  torrent_state_display: string
  magnet: string
  title?: string
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
  const { patch, del } = useApi()
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

  const handleIgnore = async () => {
    try {
      await patch(`torrent/${torrent.id}/`, {
        torrent_state: 'i',
      })
      setRefresh(true)
    } catch {
      console.error('failed to update torrent')
    }
  }

  const progress = torrent?.progress
  let validatedProgress = null
  if (progress !== null && progress !== undefined) {
    validatedProgress = Math.min(100, Math.max(0, progress))
  }

  return (
    <div className="p-4 my-4 border border-accent-1">
      {torrent.title && <P className="mb-2">{torrent.title}</P>}
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
        <P className="bg-accent-3 p-2 mb-2 wrap-break-word">
          {isExpanded ? torrent.magnet : torrent.magnet_hash}
        </P>
        <div className="flex gap-2">
          {(torrent.torrent_state === 'u' ||
            torrent.torrent_state === 'q' ||
            torrent.torrent_state === 'd') && (
            <Button className="mr-2" onClick={handleIgnore}>
              Ignore
            </Button>
          )}
          <Button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Show Hash' : 'Show Magnet'}
          </Button>
          {torrent.torrent_state === 'i' && (
            <>
              {deleteConfirm ? (
                <>
                  <LucideIconWrapper
                    title="Confirm Delete"
                    name="Check"
                    onClick={handleDelete}
                    className="cursor-pointer"
                  />
                  <LucideIconWrapper
                    title="Cancel Delete"
                    name="X"
                    onClick={() => setDeleteConfirm(false)}
                    className="cursor-pointer"
                    colorClassName="text-green-700"
                  />
                </>
              ) : (
                <LucideIconWrapper
                  title="Delete"
                  name="Trash2Icon"
                  onClick={() => setDeleteConfirm(true)}
                  className="cursor-pointer"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Torrent
