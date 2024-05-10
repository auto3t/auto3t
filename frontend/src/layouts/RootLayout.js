import { NavLink, Outlet } from "react-router-dom";
import Login from '../pages/Login';
import useAuthStore from "../stores/AuthStore";

export default function RootLayout() {

  const {accessToken, logout} = useAuthStore();

  if (!accessToken) {
    return <Login />
  }

  const handleLogout = () => {
    logout();
  }

  return (
    <>
      <header className="boxed-content">
        <nav className="main-nav">            
          <div className="nav-items">
            <img src="/logo.png" />
            <NavLink className='nav-item' to="/">Home</NavLink>
            <NavLink className='nav-item' to="media">Media</NavLink>
            <NavLink className='nav-item' to="search">Search</NavLink>
            <NavLink className='nav-item' to="settings">Settings</NavLink>
          </div>
          {accessToken && (<button onClick={handleLogout}>Logout</button>)}
        </nav>
      </header>
      <main className="boxed-content">
        <Outlet />
      </main>
    </>
  )
}
