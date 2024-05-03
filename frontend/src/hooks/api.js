// api.js
import { useState } from 'react';
import { useAuth } from '../context/useAuth';

const API_BASE = 'http://localhost:8000/api/';
const AUTH_BASE = 'http://localhost:8000/auth/';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {accessToken, setAccessToken, refreshToken} = useAuth();

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
      const response = await fetch(`${API_BASE}${url}`, options);

      if (!response.ok) {
        if (response.status === 401 && retry) {
          await handleTokenRefresh();
          return await fetchData(url, method, body, false);
        }
        throw new Error('Network response was not ok');
      }

      return await response.json();
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const get = async (url) => {
    return await fetchData(url);
  };

  const post = async (url, body) => {
    return await fetchData(url, 'POST', body);
  };

  const put = async (url, body) => {
    return await fetchData(url, 'PUT', body);
  };

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
    }
  };

  return { loading, error, get, post, put, del };
};

export default useApi;
