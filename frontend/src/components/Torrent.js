const Torrent = ({ torrent }) => {
  return (
    <div>
      <h2>Torrent</h2>
      <div className="tag-group">
        <span className="tag-item">Type: {torrent.torrent_type_display}</span>
        <span className="tag-item">State: {torrent.torrent_state_display}</span>
      </div>
      <p>{torrent.magnet}</p>
    </div>
  )
}

export default Torrent;
