import { Link, useLocation } from "react-router-dom"

export default function Breadcrumbs() {

  const location = useLocation();
  let currentLink = '';
  const crumbs = location.pathname.split('/')
    .filter(crumb => crumb !== '')
    .map(crumb => {
      currentLink += `/${crumb}`

      return (
        <span className="crumb" key={crumb}>
          <Link to={currentLink}>{crumb}</Link>
        </span>
      )
    })

  return (
    <div className="breadCrumbs">{crumbs}</div>
  )
}
