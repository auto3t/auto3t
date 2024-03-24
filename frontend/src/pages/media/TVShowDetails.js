import { Link, useLoaderData, useParams } from "react-router-dom"

export default function TVShowDetail() {

  const { id } = useParams()
  const show = useLoaderData()

  return (
    <div className="tvshow-detail">
      <h2>{ show.name }</h2>
      <div dangerouslySetInnerHTML={{ __html: show.description }} />
    </div>
  )
}

export const showDetailsLoader = async ({params}) => {
  const { id } = params
  const res = await fetch(`http://localhost:8000/api/show/${id}/`)
  return res.json()
}
