import { useState } from 'react'
import useApi from '../hooks/api'
import logo from '../../assets/logo.png'

export default function Login() {
  const { error, loginUser } = useApi()
  const [username, setUserName] = useState<string>()
  const [password, setPassword] = useState<string>()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginUser({ username, password })
  }

  return (
    <div className="login-wrapper">
      <div className="login-elements">
        <img src={logo} />
        <form onSubmit={handleSubmit}>
          {error && <div>{error}</div>}
          <div>
            <input
              type="text"
              placeholder="username"
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  )
}
