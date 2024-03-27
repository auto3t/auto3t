import { useEffect } from "react"
import { useParams } from "react-router-dom"
import useTVSeasonsStore from "../../stores/SeasonsStore"

export default function TVShowDetail() {

  const { id } = useParams()
  const { seasons, setSeasons } = useTVSeasonsStore()

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/season/?show=${id}`);
        const data = await res.json();
        setSeasons(data.results);
      } catch (error) {
        console.error("error fetching seasons: " , error);
      }
    };
    fetchSeasons();
  }, [setSeasons]);

  return (
    <>
      <div className="tvshow-detail">
        <h2>Show Details</h2>
        <p>Show ID: {id}</p>
      </div>
      <div>
        <h3>Seasons</h3>
        {seasons.map((season) => (
          <div key={season.id}>
            <p>Season: {season.number}</p>
          </div>
        ))}
      </div>
    </>
  )
}
