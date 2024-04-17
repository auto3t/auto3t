import { Link } from "react-router-dom";
import ImageComponent from "./ImageComponent";

const Show = ({ show }) => {
    return (
        <Link to={`${show.id}`}>
            <div key={show.id} className="show-item">
                <ImageComponent imagePath={show.image} alt={'show-poster-' + show.name} />
                <h3>{show.name}</h3>
            </div>
        </Link>
    )
}

export default Show;
