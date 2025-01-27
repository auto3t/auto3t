import { NavLink, Outlet } from 'react-router-dom'
import Login from '../pages/Login'
import useAuthStore from '../stores/AuthStore'
import NotificationBox from '../components/Notifications'
import useNotificationStore from '../stores/NotificationStore'
import logo from '../../assets/logo.png'
import useApi from '../hooks/api'
import useUserProfileStore from '../stores/UserProfileStore'
import { useEffect } from 'react'

export default function RootLayout() {
  const { accessToken, logout } = useAuthStore()
  const { setUserProfile } = useUserProfileStore()
  const { get } = useApi()
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await get('user/profile/')
        setUserProfile(data)
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }
    fetchProfile()
  }, [])

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
