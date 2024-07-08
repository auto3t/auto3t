import { Link } from "react-router-dom";

export default function Movies() {
  return (
    <div className="movies">
      <h1>Movies</h1>
      <Link to={'search'}>Add</Link>
      <p>Coming soon!</p>
    </div>
  )
}
