import { useParams } from "react-router-dom"

export default function TVShowDetail() {

  const { id } = useParams()

  return (
    <>
      <div className="tvshow-detail">
        <h2>Show Details</h2>
        <p>Show ID: {id}</p>
      </div>
      <div>
        <h3>Seasons</h3>
      </div>
    </>
  )
}
