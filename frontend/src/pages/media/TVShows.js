import { useEffect } from "react";
import useTVShowsStore from "../../stores/ShowsStore";
import Show from "../../components/Show";

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
      <div className="show-items">
        {shows.map((show) => (
          <Show key={show.id} show={show} />
        ))}
      </div>
    </div>
  )
}
