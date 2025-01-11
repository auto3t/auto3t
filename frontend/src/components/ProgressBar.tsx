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
    <div className="progress-bar-background">
      <div className="progress-bar" style={{ width: `${validatedProgress}%` }}>
        <span className="smaller">{validatedProgress}%</span>
      </div>
    </div>
  )
}

export default ProgressBar
