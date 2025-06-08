import { TorrentType } from './Torrent'

interface TorrentBarInterface {
  torrents: TorrentType[]
}

const ProgressBar: React.FC<TorrentBarInterface> = ({ torrents }) => {
  let validatedProgress = null
  for (let i = 0; i < torrents.length; i++) {
    const torrent = torrents[i]
    if (torrent?.progress && torrent?.torrent_state !== 'i') {
      validatedProgress = torrent.progress
    }
  }
  if (!validatedProgress) return

  return (
    <div className="absolute w-full bg-accent-1 bottom-0">
      <div
        className="text-center bg-accent-2 text-main-fg"
        style={{ width: `${validatedProgress}%` }}
      >
        <span>{validatedProgress}%</span>
      </div>
    </div>
  )
}

export default ProgressBar
