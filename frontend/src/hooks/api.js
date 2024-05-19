// api.js
import { useState } from 'react';
import useAuthStore from '../stores/AuthStore';

const API_BASE = 'http://localhost:8000/api/';
const AUTH_BASE = 'http://localhost:8000/auth/';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { accessToken, setAccessToken, refreshToken, setToken } = useAuthStore();

  const fetchData = async (url, method = 'GET', body = null, retry = true) => {
    setLoading(true);
    setError(null);

    const options = {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      let response = await fetch(`${API_BASE}${url}`, options);

      if (!response.ok) {
        if (response.status === 401 && retry) {
          await handleTokenRefresh();
          const latestAccessToken = useAuthStore.getState().accessToken;
          options.headers['Authorization'] = `Bearer ${latestAccessToken}`;
          response = await fetch(`${API_BASE}${url}`, options);
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return true;
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch (`${AUTH_BASE}token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })
      if (!response.ok) {
        setError(response.detail || 'Failed to login');
        setLoading(false);
      } else {
        const tokenResponse = await response.json();
        setToken(tokenResponse);
        setError(null);
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const get = async (url) => {
    return await fetchData(url);
  };

  const post = async (url, body) => {
    return await fetchData(url, 'POST', body);
  };

  const put = async (url, body) => {
    return await fetchData(url, 'PUT', body);
  };

  const patch = async (url, body) => {
    return await fetchData(url, 'PATCH', body);
  }

  const del = async (url) => {
    return await fetchData(url, 'DELETE');
  };

  const handleTokenRefresh = async () => {
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }
    try {
      const response = await fetch(`${AUTH_BASE}token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!response.ok) {
        throw new Error('Refresh failed');
      }
      const data = await response.json();
      setAccessToken(data.access);
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  };

  return { loading, error, get, post, patch, put, del, loginUser};
};

export default useApi;
