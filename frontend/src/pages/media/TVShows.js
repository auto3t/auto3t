import { Link, useLoaderData } from "react-router-dom"

export default function TVShows() {

  const shows = useLoaderData();

  return (
    <div className="tvshows">
      <h2>TV Shows</h2>
      {shows.results.map(show => (
        <div key={show.id}>
          <h3>{show.name}</h3>
          <Link to={`${show.id}`}>Details</Link>
        </div>
      ))}
    </div>
  )
}


export const showsLoader = async () => {
  const res = await fetch('http://localhost:8000/api/show/')
  return res.json()
}
