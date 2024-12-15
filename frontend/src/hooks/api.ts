// api.js
import { useState } from 'react';
import useAuthStore from '../stores/AuthStore';

const API_BASE = `${process.env.REACT_APP_API_URL || window.location.origin}/api/`;
const AUTH_BASE = `${process.env.REACT_APP_API_URL || window.location.origin}/auth/`;

type OptionsType = {
  method: string
  headers: any
  body?: string
}

const useApi = () => {

  const [error, setError] = useState<string | null>(null);
  const {
    accessToken,
    logout,
    refreshToken,
    setAccessToken,
    setToken,
  } = useAuthStore();

  const fetchData = async (url: string, method = 'GET', body = null, retry = true) => {
    setError(null);

    const options: OptionsType = {
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
          const errorResponse = JSON.stringify(await response.json());
          throw new Error(`HTTP error! status ${response.status} - ${errorResponse}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('image/jpeg')) {
        return await response.blob();
      }
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return true;
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("data fetching failed");
      }
      throw error;
    }
  };

  const loginUser = async (credentials: any) => {
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
        const errorResponse = await response.json();
        setError(errorResponse.detail || 'Failed to login');
      } else {
        const tokenResponse = await response.json();
        setToken(tokenResponse);
        setError(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("login failed");
      }
      throw error;
    }
  }

  const getImage = async (url: string) => {

    try {
      const blob = await fetchData(url);
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  
  }

  const get = async (url: string) => {
    return await fetchData(url);
  };

  const post = async (url: string, body: any) => {
    return await fetchData(url, 'POST', body);
  };

  const put = async (url: string, body: any) => {
    return await fetchData(url, 'PUT', body);
  };

  const patch = async (url: string, body: any) => {
    return await fetchData(url, 'PATCH', body);
  }

  const del = async (url: string) => {
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
      logout();
    }
  };

  return { error, get, post, patch, put, del, loginUser, getImage};
};

export default useApi;
