import useSelectedSeasonStore from '../../stores/SeasonSelectedStore'
import ImageComponent, { ImageType } from '../ImageComponent'
import { KeywordType } from '../settings/Keywords'
import { ShowType } from './ShowDetail'
import posterDefault from '../../../assets/poster-default.jpg'
import { H3 } from '../Typography'

export type SeasonType = {
  id: number
  number: number
  image_season?: ImageType
  season_fallback?: ImageType
  description: string
  tvmaze_id: string
  remote_server_url: string
  release_date: string
  end_date: string
  all_keywords: KeywordType[]
  search_query: string
  show: ShowType
}

interface SeasonComponent {
  season: SeasonType
  onClick: (arg0: number) => void
}

const Season: React.FC<SeasonComponent> = ({ season, onClick }) => {
  const { selectedSeason } = useSelectedSeasonStore()

  const getSeasonPoster = (season: SeasonType) => {
    if (season.image_season?.image) return season.image_season
    if (season.show?.season_fallback?.image) return season.show.season_fallback
    return { image: posterDefault }
  }

  return (
    <div className="cursor-pointer" onClick={() => onClick(season.id)}>
      <ImageComponent
        image={getSeasonPoster(season)}
        alt={'season-poster-' + season.number}
      />
      <div
        className={`pl-2 text-center ${selectedSeason?.id === season.id ? 'bg-accent-3' : ''}`}
      >
        <H3>Season {season.number.toString()}</H3>
      </div>
    </div>
  )
}

export default Season
