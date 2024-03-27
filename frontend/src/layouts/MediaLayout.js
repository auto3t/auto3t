import { NavLink, Outlet } from "react-router-dom";

export default function MediaRootLayout() {
    return (
        <div>
            <h2>Layout</h2>
            <nav>
                <div className="nav-items">
                    <NavLink className='nav-item' to="movie">Movies</NavLink>
                    <NavLink className='nav-item' to="tv">TV</NavLink>
                </div>
            </nav>
            <Outlet />
        </div>
    )
}
