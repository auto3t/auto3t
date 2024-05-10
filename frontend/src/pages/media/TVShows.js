import { useEffect, useState } from "react";
import useTVShowsStore from "../../stores/ShowsStore";
import ShowTile from "../../components/ShowTile";
import useApi from "../../hooks/api";

export default function TVShows() {

  const { get } = useApi();
  const { shows, setShows } = useTVShowsStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const data = await get('show/');
        setShows(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching shows:", error);
        setIsLoading(false);
      }
    };

    fetchShows();
  }, [setShows]);

  return (
    <div className="tvshows">
      <h1>TV Shows</h1>
      <div className="show-items">
        {isLoading ? (
          <p>Loading...</p>
        ) : shows && shows.length > 0 ? (
          shows.map((show) => (
            <ShowTile key={show.id} show={show} />
          ))
        ) : (
          <p>No Shows found.</p>
        )}
      </div>
    </div>
  );
}
