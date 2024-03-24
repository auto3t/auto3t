import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <h2>Page Not Found.</h2>
      <p>Go <Link path='/'>Home</Link></p>
    </div>
  )
}
