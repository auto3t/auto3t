import { Link, Outlet } from 'react-router-dom'
import Login from '../pages/Login'
import useAuthStore from '../stores/AuthStore'
import NotificationBox from '../components/Notifications'
import useNotificationStore from '../stores/NotificationStore'
import logo from '../../assets/logo.png'
import useApi from '../hooks/api'
import { useEffect } from 'react'
import useUserProfileStore from '../stores/UserProfileStore'
import { Button, P, StyledNavLink } from '../components/Typography'

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
      <div className="grow my-2 mx-5">
        <header className="max-w-7xl m-auto">
          <nav className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Link to="/">
                <img className="w-[180px]" src={logo} />
              </Link>
              <StyledNavLink to="tv">TV</StyledNavLink>
              <StyledNavLink to="movie">Movie</StyledNavLink>
              <StyledNavLink to="collection">Collections</StyledNavLink>
              <StyledNavLink to="settings">Settings</StyledNavLink>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleShowNotifications}>
                Show Notifications
              </Button>
              {isLoggedIn && <Button onClick={handleLogout}>Logout</Button>}
            </div>
          </nav>
        </header>
        <main className="max-w-7xl m-auto">
          <Outlet />
          <NotificationBox />
        </main>
      </div>
      <footer className="bg-accent-3 py-4 text-center shrink mt-15">
        <div className="max-w-7xl m-auto">
          <P>
            © AutoT {new Date().getFullYear()} - v0.0.1{' '}
            {commitHash && `- ${commitHash.substring(0, 7)}`}
          </P>
        </div>
      </footer>
    </>
  )
}
