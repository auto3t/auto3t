import { useState } from 'react'
import useApi from '../hooks/api'
import logo from '../../assets/logo.png'
import { Button, Input, P } from '../components/Typography'

export default function Login() {
  const { error, loginUser } = useApi()
  const [username, setUserName] = useState<string>()
  const [password, setPassword] = useState<string>()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginUser({ username, password })
  }

  return (
    <div className="flex justify-center items-center h-[100vh] text-center">
      <div className="w-[200px] max-w-[80%]">
        <img className="w-full" src={logo} />
        <form onSubmit={handleSubmit}>
          {error && <P variant="alert">{error}</P>}
          <div>
            <Input
              type="text"
              placeholder="username"
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div>
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
  )
}
