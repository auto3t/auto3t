import { Link, useRouteError } from 'react-router-dom'

export default function TVShowError() {
  const error = useRouteError()

  let errorMessage = 'An unknown error occurred fetching tv shows'
  if (error instanceof Error) {
    errorMessage = error.message
  }

  return (
    <div className="error">
      <h2>Error</h2>
      <p>{errorMessage}</p>
      <Link to={'/'}>Back to Home</Link>
    </div>
  )
}
