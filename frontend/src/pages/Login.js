import { useState } from 'react'
import useApi from '../hooks/api';

export default function Login() {

  const { error, loginUser } = useApi();
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async e => {
    e.preventDefault();
    loginUser({username, password});
  }

  return(
    <div className="login-wrapper">
      <div className='login-elements'>
        <img src='/logo.png' />
        <form onSubmit={handleSubmit}>
          {error && <div>{error}</div>}
          <div>
            <input 
              type="text"
              placeholder="username"
              onChange={e => setUserName(e.target.value)}
            />  
          </div>
          <div>
            <input
              type="password"
              placeholder="password"
              onChange={e => setPassword(e.target.value)}
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
