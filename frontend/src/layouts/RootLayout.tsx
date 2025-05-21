import { NavLink, Outlet } from 'react-router-dom'
import Login from '../pages/Login'
import useAuthStore from '../stores/AuthStore'
import NotificationBox from '../components/Notifications'
import useNotificationStore from '../stores/NotificationStore'
import logo from '../../assets/logo.png'
import useApi from '../hooks/api'
import { useEffect } from 'react'
import useUserProfileStore from '../stores/UserProfileStore'

export default function RootLayout() {
  const { isLoggedIn } = useAuthStore()
  const { setUserProfile } = useUserProfileStore()
  const { get } = useApi()
  const { logoutUser } = useApi()
  const { showNotifications, setShowNotifications } = useNotificationStore()

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

  if (!isLoggedIn) {
    return <Login />
  }

  const handleLogout = () => {
    logoutUser()
  }

  const handleShowNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const commitHash = import.meta.env.VITE_GIT_COMMIT

  return (
    <>
      <div className="main">
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
      </div>
      <footer>
        <div className="boxed-content">
          <p>
            © AutoT {new Date().getFullYear()} - v0.0.1{' '}
            {commitHash && `- ${commitHash.substring(0, 7)}`}
          </p>
        </div>
      </footer>
    </>
  )
}
