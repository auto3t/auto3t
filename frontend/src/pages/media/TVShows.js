import { useEffect, useState } from "react";
import useTVShowsStore from "../../stores/ShowsStore";
import ShowTile from "../../components/ShowTile";
import useApi from "../../hooks/api";

export default function TVShows() {

  const [isLoadingShows, setIsLoadingShows] = useState(true);
  const { error, get } = useApi();
  const { shows, setShows } = useTVShowsStore();

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const data = await get('show/');
        setShows(data);
      } catch (error) {
        console.error("Error fetching shows:", error);
      }
      setIsLoadingShows(false);
    };

    fetchShows();
  }, [setShows]);

  return (
    <div className="tvshows">
      <h1>TV Shows</h1>
      <div className="show-items">
        {isLoadingShows ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : shows.length > 0 ? (
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
