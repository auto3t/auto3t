import PropTypes from 'prop-types'
import { useState } from 'react'


async function loginUser(credentials) {
  return fetch('http://localhost:8000/auth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
    .then(data => data.json())
}


export default function Login({ setToken }) {

  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async e => {
    e.preventDefault();
    const token = await loginUser({
      username,
      password
    });
    setToken(token);
  }

  return(
    <div className="login-wrapper">
      <h1>Please Log In</h1>
      <form onSubmit={handleSubmit}>
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
