import useSelectedSeasonStore from "../stores/SeasonSelectedStore";
import ImageComponent, { ImageType } from "./ImageComponent";
import { KeywordType } from "./Keywords";
import { ShowType } from "./ShowDetail";

export type SeasonType = {
  id: number
  number: number
  image_season?: ImageType
  season_fallback?: ImageType
  description: string
  remote_server_id: string
  remote_server_url: string
  release_date: string
  end_date: string
  all_keywords: KeywordType[]
  search_query: string
  show: ShowType
}

interface SeasonComponent {
  season: SeasonType;
  onClick: any;
}

const Season: React.FC<SeasonComponent> = ({ season, onClick }) => {

  const { selectedSeason } = useSelectedSeasonStore();

  const getSeasonPoster = (season: SeasonType) => {
    if (season.image_season?.image) return season.image_season
    if (season.show?.season_fallback?.image) return season.show.season_fallback
    return {image: '/poster-default.jpg'}
  }

  return (
    <div className="season-item pointer" onClick={() => onClick(season.id)}>
      <ImageComponent image={getSeasonPoster(season)} alt={'season-poster-' + season.number} />
      <div className={`tile-description ${selectedSeason?.id === season.id ? 'active' : ''}`}>
        <h3>Season {season.number.toString()}</h3>
      </div>
    </div>
  );
};

export default Season;
