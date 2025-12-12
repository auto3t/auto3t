import { Link, Outlet } from 'react-router-dom'
import Login from '../pages/Login'
import useAuthStore from '../stores/AuthStore'
import NotificationBox from '../components/Notifications'
import useNotificationStore from '../stores/NotificationStore'
import logo from '../../assets/logo.png'
import useApi from '../hooks/api'
import { useEffect } from 'react'
import useUserProfileStore from '../stores/UserProfileStore'
import {
  LucideIconWrapper,
  P,
  Spacer,
  StyledNavLink,
} from '../components/Typography'
import ProgressIndicator from '../components/ProgressIndicator'
import SupportBar from '../components/SupportBar'

export default function RootLayout() {
  const { isLoggedIn } = useAuthStore()
  const { userProfile, setUserProfile } = useUserProfileStore()
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
  const releaseTag = import.meta.env.VITE_GIT_TAG

  return (
    <>
      <div className="grow my-2 mx-5">
        <header className="max-w-7xl m-auto">
          <nav className="flex flex-wrap md:justify-between justify-center items-center">
            <div className="flex flex-wrap justify-center md:justify-left gap-4 items-center py-4">
              <Link to="/">
                <img className="md:w-[180px] w-[90px]" src={logo} />
              </Link>
              <div className="flex flex-wrap gap-2 justify-center">
                <div className="flex gap-2 flex-wrap justify-center">
                  <StyledNavLink to="tv">TV</StyledNavLink>
                  <StyledNavLink to="movie">Movie</StyledNavLink>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <StyledNavLink to="collection">Collections</StyledNavLink>
                  <StyledNavLink to="people">People</StyledNavLink>
                </div>
              </div>
            </div>
            <div className="flex gap-2 py-4">
              <ProgressIndicator />
              <LucideIconWrapper
                size={30}
                title="Show notifications"
                onClick={handleShowNotifications}
                name="BellIcon"
                className="cursor-pointer"
              />
              <Link to="settings">
                <LucideIconWrapper size={30} name="Settings" title="Settings" />
              </Link>
              {isLoggedIn && (
                <LucideIconWrapper
                  size={30}
                  title="Logout"
                  name="LogOutIcon"
                  className="cursor-pointer"
                  onClick={handleLogout}
                />
              )}
            </div>
          </nav>
        </header>
        <main className="max-w-7xl m-auto">
          {userProfile !== null && <SupportBar userProfile={userProfile} />}
          <Outlet />
          <NotificationBox />
        </main>
      </div>
      <footer className="bg-accent-3 py-4 text-center shrink mt-15">
        <div className="flex justify-center max-w-7xl m-auto">
          <P className="flex items-center flex-wrap justify-center">
            <span>© Auto3T {new Date().getFullYear()}</span>
            <Spacer />
            {releaseTag === 'unstable' ? (
              <span>{releaseTag}</span>
            ) : releaseTag ? (
              <Link
                to={`https://github.com/auto3t/auto3t/releases/tag/${releaseTag}`}
              >
                {releaseTag}
              </Link>
            ) : (
              <span>dev</span>
            )}
            {commitHash && (
              <>
                <Spacer />
                <Link
                  className="hover:border-white border-b-2 border-transparent"
                  to={`https://github.com/auto3t/auto3t/commit/${commitHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {commitHash.substring(0, 7)}
                </Link>
              </>
            )}
            <Spacer />
            <Link
              className="hover:border-white border-b-2 border-transparent"
              to="https://github.com/auto3t/auto3t"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </Link>
            <Spacer />
            <Link
              className="hover:border-white border-b-2 border-transparent"
              to="https://docs.auto3t.com/"
              target="_blank"
              rel="noreferrer"
            >
              Docs
            </Link>
          </P>
        </div>
      </footer>
    </>
  )
}
