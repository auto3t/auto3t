import useSelectedSeasonStore from "../stores/SeasonSelectedStore";
import ImageComponent from "./ImageComponent";

const Season = ({ season, onClick }) => {

  const { selectedSeason } = useSelectedSeasonStore();

  return (
    <div className="season-item pointer" key={season.id} onClick={() => onClick(season.id)}>
      <ImageComponent image={season.image_season || season.show.season_fallback} alt={'season-poster-' + season.number} />
      <div className={`tile-description ${selectedSeason?.id === season.id ? 'active' : ''}`}>
        <h3>Season {season.number}</h3>
      </div>
    </div>
  );
};

export default Season;
