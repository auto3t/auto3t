const Season = ({ season, onClick }) => {
  return (
    <div className="season-item pointer" key={season.id} onClick={() => onClick(season.id)}>
      <img src={season.image} alt='season-poster' />
      <p>Season {season.number}</p>
    </div>
  );
};

export default Season;
