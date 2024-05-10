// show tile for show grid

import { Link } from "react-router-dom";
import ImageComponent from "./ImageComponent";

const ShowTile = ({ show }) => {
  return (
    <Link to={`${show.id}`}>
      <div key={show.id} className="show-item">
        <ImageComponent imagePath={show.image} alt={'show-poster-' + show.name} />
        <h2>{show.name}</h2>
      </div>
    </Link>
  )
}

export default ShowTile;
