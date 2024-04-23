import { useContext, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";

export default function RootLayout() {
  const { isAuthenticated } = useContext(AuthContext);
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
  };

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
            {isAuthenticated && (<a onClick={handleLogout} className="nav-item pointer">Logout</a>)}
          </div>
        </nav>
      </header>
      <main className="boxed-content">
        <Outlet />
      </main>
    </>
  )
}
