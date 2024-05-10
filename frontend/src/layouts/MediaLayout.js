import { NavLink, Outlet } from "react-router-dom";

export default function MediaRootLayout() {
  return (
    <div>
      <nav className="secondary-nav">
        <div className="nav-items">
          <NavLink className='nav-item' to="movie">Movies</NavLink>
          <NavLink className='nav-item' to="tv">TV</NavLink>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
