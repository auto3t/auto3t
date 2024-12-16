import { NavLink, Outlet } from 'react-router-dom'
import Login from '../pages/Login'
import useAuthStore from '../stores/AuthStore'
import NotificationBox from '../components/Notifications'
import useNotificationStore from '../stores/NotificationStore'
import logo from '../../assets/logo.png'

export default function RootLayout() {
  const { accessToken, logout } = useAuthStore()
  const { showNotifications, setShowNotifications } = useNotificationStore()

  if (!accessToken) {
    return <Login />
  }

  const handleLogout = () => {
    logout()
  }

  const handleShowNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  return (
    <>
      <header className="boxed-content">
        <nav className="main-nav">
          <div className="nav-items">
            <img src={logo} />
            <NavLink className="nav-item" to="/">
              Home
            </NavLink>
            <NavLink className="nav-item" to="tv">
              TV
            </NavLink>
            <NavLink className="nav-item" to="movie">
              Movie
            </NavLink>
            <NavLink className="nav-item" to="settings">
              Settings
            </NavLink>
          </div>
          <div>
            <button onClick={handleShowNotifications}>
              Show Notifications
            </button>
            {accessToken && <button onClick={handleLogout}>Logout</button>}
          </div>
        </nav>
      </header>
      <main className="boxed-content">
        <Outlet />
        <NotificationBox />
      </main>
    </>
  )
}
