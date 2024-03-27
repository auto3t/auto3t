const Season = ({ season, onClick }) => {
  return (
    <div key={season.id} onClick={() => onClick(season.id)}>
      <p>Season: {season.number}</p>
    </div>
  );
};

export default Season;
