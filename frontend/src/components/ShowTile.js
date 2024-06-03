// show tile for show grid

import { Link } from "react-router-dom";
import ImageComponent from "./ImageComponent";

const ShowTile = ({ show }) => {

  const getShowPoster = (show) => {
    if (show.image_show?.image) return show.image_show
    return {image: '/poster-default.jpg'}
  }

  return (
    <Link to={`${show.id}`}>
      <div className="show-item">
        <ImageComponent image={getShowPoster(show)} alt={'show-poster-' + show.name} />
        <div className="tile-description">
          <h2>{show.name}</h2>
        </div>
      </div>
    </Link>
  )
}

export default ShowTile;
