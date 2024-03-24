import { NavLink, Outlet } from "react-router-dom";

export default function MediaRootLayout() {
    return (
        <div>
            <h2>Layout</h2>
            <nav>
                <NavLink to="movie">Movies</NavLink>
                <NavLink to="tv">TV</NavLink>
            </nav>
            <Outlet />
        </div>
    )
}
