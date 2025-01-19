// show tile for show grid

import { Link } from 'react-router-dom'
import ImageComponent from './ImageComponent'
import { ShowType } from './ShowDetail'
import posterDefault from '../../assets/poster-default.jpg'

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
      <div className="show-item">
        <ImageComponent
          image={getShowPoster(show)}
          alt={'show-poster-' + show.name}
        />
        <div className="tile-description">
          <h2>{show.name}</h2>
        </div>
      </div>
    </Link>
  )
}

export default ShowTile
