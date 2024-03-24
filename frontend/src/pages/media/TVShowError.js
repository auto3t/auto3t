import { Link, useRouteError } from "react-router-dom"

export default function TVShowError() {

  const error = useRouteError()

  return (
    <div className="error">
      <h2>Error</h2>
      <p>{ error.message }</p>
      <Link to={'/'}>Back to Home</Link>
    </div>
  )
}
