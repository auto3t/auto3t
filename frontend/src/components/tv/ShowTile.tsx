// show tile for show grid

import { Link } from 'react-router-dom'
import ImageComponent from '../ImageComponent'
import { ShowType } from './ShowDetail'
import posterDefault from '../../../assets/poster-default.jpg'
import { H3, TagItem } from '../Typography'

interface ShowTileInterface {
  show: ShowType
}

const ShowTile: React.FC<ShowTileInterface> = ({ show }) => {
  const getShowPoster = (show: ShowType) => {
    if (show.image_show?.image) return show.image_show
    return { image: posterDefault }
  }

  return (
    <Link to={`/tv/show/${show.id}`}>
      <div className="relative">
        <ImageComponent
          image={getShowPoster(show)}
          alt={'show-poster-' + show.name}
        />
        <div className="flex flex-wrap justify-end gap-2 absolute top-0 right-0 m-4">
          <TagItem title={show.status_display}>{show.status || '-'}</TagItem>
          {show.imdb_rating && <TagItem>IMDb {show.imdb_rating}/10</TagItem>}
        </div>
      </div>
      <div className="text-center">
        <H3>{show.name}</H3>
      </div>
    </Link>
  )
}

export default ShowTile
