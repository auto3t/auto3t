import { useLoaderData, useParams } from "react-router-dom"

export default function TVShowDetail() {

  const { id } = useParams()
  const show = useLoaderData()

  return (
    <div className="tvshow-detail">
      <h2>{ show.name }</h2>
      <p>Show ID: {id}</p>
      <div dangerouslySetInnerHTML={{ __html: show.description }} />
    </div>
  )
}

export const showDetailsLoader = async ({params}) => {
  const { id } = params
  const res = await fetch(`http://localhost:8000/api/show/${id}/`)

  if (!res.ok) {
    throw Error('could not fetch show')
  }

  return res.json()
}
