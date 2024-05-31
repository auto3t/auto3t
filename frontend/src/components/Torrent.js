import { useState } from "react";

const Torrent = ({ torrent }) => {

  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const displayMagnet = isExpanded ? torrent.magnet : torrent.magnet.slice(0, 60);

  return (
    <div>
      <h2>Torrent</h2>
      <div className="tag-group">
        <span className="tag-item">Type: {torrent.torrent_type_display}</span>
        <span className="tag-item">State: {torrent.torrent_state_display}</span>
      </div>
      <div>
        <p className="text-blob">{displayMagnet}{!isExpanded && '...'}</p>
        <button onClick={toggleExpansion}>
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
    </div>
  )
}

export default Torrent;
