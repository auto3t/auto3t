import ImageComponent from "./ImageComponent";

const Season = ({ season, onClick }) => {
  return (
    <div className="season-item pointer" key={season.id} onClick={() => onClick(season.id)}>
      <ImageComponent image={season.image_season} alt={'season-poster-' + season.number} />
      <h3>Season {season.number}</h3>
    </div>
  );
};

export default Season;
