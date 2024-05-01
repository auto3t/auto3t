import PropTypes from 'prop-types'
import { useState } from 'react'
import { loginUser } from '../api';

export default function Login({ setToken }) {

  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    const tokenResponse = await loginUser({
      username,
      password
    });
    if (tokenResponse.access) {
      setToken(tokenResponse);
      setError('');
    } else {
      setError(tokenResponse.detail || 'Failed to login');
    }
  }

  return(
    <div className="login-wrapper">
      <h1>Please Log In</h1>
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
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
}
