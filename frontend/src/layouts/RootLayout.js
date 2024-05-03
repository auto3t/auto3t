import { NavLink, Outlet } from "react-router-dom";
import Login from '../pages/Login';
import useAuthStore from "../stores/AuthStore";

export default function RootLayout() {

  const {accessToken, setToken, logout} = useAuthStore();

  if (!accessToken) {
    return <Login setToken={setToken} />
  }

  const handleLogout = () => {
    logout();
  }

  return (
    <>
      <header className="boxed-content">
        <nav>
          <h1>AutoT</h1>
          <div className="nav-items">
            <NavLink className='nav-item' to="/">Home</NavLink>
            <NavLink className='nav-item' to="media">Media</NavLink>
            <NavLink className='nav-item' to="search">Search</NavLink>
            <NavLink className='nav-item' to="settings">Settings</NavLink>
            {accessToken && (<button onClick={handleLogout}>Logout</button>)}
          </div>
        </nav>
      </header>
      <main className="boxed-content">
        <Outlet />
      </main>
    </>
  )
}
