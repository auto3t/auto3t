import ImageComponent from "./ImageComponent";

const Season = ({ season, onClick }) => {
  return (
    <div className="season-item pointer" key={season.id} onClick={() => onClick(season.id)}>
      <ImageComponent imagePath={season.image} alt={'season-poster-' + season.number} />
      <p>Season {season.number}</p>
    </div>
  );
};

export default Season;
