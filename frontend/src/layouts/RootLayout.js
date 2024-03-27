import { NavLink, Outlet } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";

export default function RootLayout() {
  return (
    <>
      <header className="boxed-content">
        <nav>
          <h1>AutoT</h1>
          <div className="nav-items">
            <NavLink className='nav-item' to="/">Home</NavLink>
            <NavLink className='nav-item' to="media">Media</NavLink>
            <NavLink className='nav-item' to="settings">Settings</NavLink>
          </div>
        </nav>
        <Breadcrumbs />
      </header>
      <main className="boxed-content">
        <Outlet />
      </main>
    </>
  )
}
