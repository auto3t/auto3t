// show tile for show grid

import { Link } from 'react-router-dom'
import ImageComponent from './ImageComponent'
import { ShowType } from './ShowDetail'
import posterDefault from '../../assets/poster-default.jpg'
import { H3 } from './Typography'

interface ShowTileInterface {
  show: ShowType
}

const ShowTile: React.FC<ShowTileInterface> = ({ show }) => {
  const getShowPoster = (show: ShowType) => {
    if (show.image_show?.image) return show.image_show
    return { image: posterDefault }
  }

  return (
    <Link to={`show/${show.id}`}>
      <div>
        <ImageComponent
          image={getShowPoster(show)}
          alt={'show-poster-' + show.name}
        />
        <div className="text-center">
          <H3>{show.name}</H3>
        </div>
      </div>
    </Link>
  )
}

export default ShowTile
