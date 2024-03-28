const Episode = ({ episode }) => {
  return (
    <div className="episode-item">
      <img src={episode.image_url} alt={'episode-poster-' + episode.number} />
      <p>S{String(episode.season.number).padStart(2, '0')}E{String(episode.number).padStart(2, '0')} - {episode.title}</p>
    </div>
  );
};

export default Episode;
