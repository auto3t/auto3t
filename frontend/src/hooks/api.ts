// api.js
import { useState } from 'react'
import useAuthStore from '../stores/AuthStore'

const API_BASE = `${import.meta.env.VITE_APP_API_URL || window.location.origin}/api/`

function getCookie(name: string) {
  let cookieValue = null

  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

const useApi = () => {
  const [error, setError] = useState<string | null>(null)
  const { setIsLoggedIn } = useAuthStore()
  const csrfToken = getCookie('csrftoken')

  const fetchData = async (
    url: string,
    method: string = 'GET',
    body: object | null = null,
    concat: boolean = true,
  ) => {
    setError(null)

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
      },
      credentials: 'include',
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    try {
      const fullURL = concat ? `${API_BASE}${url}` : url
      const response = await fetch(fullURL, options)

      if (!response.ok) {
        const errorResponse = JSON.stringify(await response.json())
        console.log(errorResponse)
        if (response.status === 403) setIsLoggedIn(false)
        throw new Error(
          `HTTP error! status ${response.status} - ${errorResponse}`,
        )
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('image/jpeg')) {
        return await response.blob()
      }
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return true
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('data fetching failed')
      }
      throw error
    }
  }

  const loginUser = async (credentials: object) => {
    setError(null)
    try {
      const response = await fetch(`${API_BASE}auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      })
      if (!response.ok) {
        if (response.status === 403 || response.status === 400) {
          const errorResponse = await response.json()
          setError(errorResponse.error || 'Failed to login')
        }
      } else {
        setIsLoggedIn(true)
        setError(null)
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('login failed')
      }
      throw error
    }
  }

  const logoutUser = async () => {
    const response = await fetch(`${API_BASE}auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
      },
      credentials: 'include',
    })
    console.log(response.json())
    setIsLoggedIn(false)
  }

  const getImage = async (url: string) => {
    try {
      const imageAPIURL = `${import.meta.env.VITE_APP_API_URL || window.location.origin}/${url}`
      const blob = await fetchData(imageAPIURL, undefined, undefined, false)
      const imageUrl = URL.createObjectURL(blob)
      return imageUrl
    } catch (error) {
      console.error('Error fetching image:', error)
      throw error
    }
  }

  const get = async (url: string) => {
    return await fetchData(url)
  }

  const post = async (url: string, body: object | null) => {
    return await fetchData(url, 'POST', body)
  }

  const put = async (url: string, body: object | null) => {
    return await fetchData(url, 'PUT', body)
  }

  const patch = async (url: string, body: object | null) => {
    return await fetchData(url, 'PATCH', body)
  }

  const del = async (url: string) => {
    return await fetchData(url, 'DELETE')
  }

  return { error, get, post, patch, put, del, loginUser, logoutUser, getImage }
}

export default useApi
