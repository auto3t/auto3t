import { Link } from "react-router-dom";

const Show = ({ show }) => {
    return (
        <Link to={`${show.id}`}>
            <div key={show.id} className="show-item">
                <img src={show.image} />
                <h3>{show.name}</h3>
            </div>
        </Link>
    )
}

export default Show;
