const Season = ({ season, onClick }) => {
  return (
    <div className="season-item" key={season.id} onClick={() => onClick(season.id)}>
      <img src={season.image} />
      <p>Season {season.number}</p>
    </div>
  );
};

export default Season;
