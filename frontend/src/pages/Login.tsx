import { useEffect, useState } from 'react'
import useApi from '../hooks/api'
import logo from '../../assets/logo.png'
import { Button, Input, P } from '../components/Typography'
import useAuthStore from '../stores/AuthStore'
import { Link } from 'react-router-dom'

export type AppStatusType = {
  user_exists: boolean
}

export default function Login() {
  const { error, loginUser, getAppStatus } = useApi()
  const { hasUser } = useAuthStore()
  const [username, setUserName] = useState<string>()
  const [password, setPassword] = useState<string>()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginUser({ username, password })
  }

  useEffect(() => {
    const fetchAppStatus = async () => {
      getAppStatus()
    }
    fetchAppStatus()
  }, [])

  return (
    <>
      <title>A3T | Login</title>
      <div className="flex justify-center items-center h-[100vh] text-center">
        <div className="w-[200px] max-w-[80%]">
          <img className="w-full pb-4" src={logo} />
          {hasUser === false && (
            <Link
              to="https://docs.auto3t.com/getting-started/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="bg-main-fg p-4 rounded-md mb-4">
                <P variant="alert">
                  It looks like there is no user created. Click here to open the
                  docs to get you started.
                </P>
              </div>
            </Link>
          )}
          <form onSubmit={handleSubmit}>
            {error && <P variant="alert">{error}</P>}
            <div>
              <Input
                type="text"
                placeholder="username"
                onChange={(e) => setUserName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="pb-2">
              <Input
                type="password"
                placeholder="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit">Login</Button>
          </form>
        </div>
      </div>
    </>
  )
}
