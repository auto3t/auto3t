import { useLoaderData, useParams } from "react-router-dom"

export default function TVShowDetail() {

  const { id } = useParams()
  const { show, seasons } = useLoaderData()

  return (
    <>
      <div className="tvshow-detail">
        <h2>{ show.name }</h2>
        <p>Show ID: {id}</p>
        <div dangerouslySetInnerHTML={{ __html: show.description }} />
      </div>
      <div>
        <h3>Seasons</h3>
        {seasons.results.map(season => (
          <div key={season.remote_server_id}>
            <p>Season: {season.number}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export const showDetailsLoader = async ({params}) => {
  const { id } = params
  const res_show = await fetch(`http://localhost:8000/api/show/${id}/`)
  const res_seasons = await fetch(`http://localhost:8000/api/season/?show=${id}`)

  if (!res_show.ok) {
    throw Error('could not fetch show')
  }
  if (!res_seasons.ok) {
    throw Error('could not fetch seasons')
  }
  const show = await res_show.json()
  const seasons = await res_seasons.json()

  return { show, seasons }
}
