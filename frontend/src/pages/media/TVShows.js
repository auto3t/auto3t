import { useEffect } from "react";
import { Link } from "react-router-dom";
import useTVShowsStore from "../../stores/shows";

export default function TVShows() {

  const { shows, setShows } = useTVShowsStore()

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/show/");
        const data = await res.json();
        setShows(data.results);
      } catch (error) {
        console.error("Error fetching shows:", error);
      }
    };

    fetchShows();
  }, [setShows]);

  return (
    <div className="tvshows">
      <h2>TV Shows</h2>
      {shows.map((show) => (
        <div key={show.id}>
          <h3>{show.name}</h3>
          <Link to={`${show.id}`}>Details</Link>
        </div>
      ))}
    </div>
  )
}
