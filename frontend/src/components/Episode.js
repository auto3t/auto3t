const Episode = ({ episode }) => {
  return (
    <div className="episode-item">
      <img src={episode.image || '/episode-default.jpg'} alt={'episode-poster-' + episode.number} />
      <p>
        <span>S{String(episode.season.number).padStart(2, '0')}</span>
        <span>E{String(episode.number).padStart(2, '0')}</span>
        <span> - {episode.title}</span>
        <span> [{episode.status || '-'}]</span>
        { episode.torrent?.progress && (<span>[{episode.torrent.progress}%]</span>)}
      </p>
    </div>
  );
};

export default Episode;
