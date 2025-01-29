import { NavLink, Outlet } from 'react-router-dom'
import Login from '../pages/Login'
import useAuthStore from '../stores/AuthStore'
import NotificationBox from '../components/Notifications'
import useNotificationStore from '../stores/NotificationStore'
import logo from '../../assets/logo.png'
import useApi from '../hooks/api'

export default function RootLayout() {
  const { isLoggedIn } = useAuthStore()
  const { logoutUser } = useApi()
  const { showNotifications, setShowNotifications } = useNotificationStore()

  if (!isLoggedIn) {
    return <Login />
  }

  const handleLogout = () => {
    logoutUser()
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
            {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
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
