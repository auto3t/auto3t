import useSelectedSeasonStore from "../stores/SeasonSelectedStore";
import ImageComponent from "./ImageComponent";

const Season = ({ season, onClick }) => {

  const { selectedSeason } = useSelectedSeasonStore();

  const getSeasonPoster = (season) => {
    if (season.image_season?.image) return season.image_season
    if (season.show?.season_fallback?.image) return season.show.season_fallback
    return {image: '/poster-default.jpg'}
  }

  return (
    <div className="season-item pointer" onClick={() => onClick(season.id)}>
      <ImageComponent image={getSeasonPoster(season)} alt={'season-poster-' + season.number} />
      <div className={`tile-description ${selectedSeason?.id === season.id ? 'active' : ''}`}>
        <h3>Season {season.number}</h3>
      </div>
    </div>
  );
};

export default Season;
