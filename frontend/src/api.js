// all backend API fetching

const API_BASE = `${window.location.origin}/api/`;
const AUTH_BASE = `${window.location.origin}/auth/`;

let isRefreshing = false;
let refreshPromise = null;

const request = async (url, method, data) => {
  const accessToken = localStorage.getItem('accessToken');
  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };

  if (data) {
    requestOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${url}`, requestOptions);
    if (!response.ok) {
      if (response.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshToken().then(newAccessToken => {
            localStorage.setItem('accessToken', newAccessToken);
            isRefreshing = false;
            return request(url, method, data);
          }).catch(error => {
            isRefreshing = false;
            console.error('Error refreshing token:', error);
            throw error;
          });
        }
        return refreshPromise;
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return true;
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  return fetch(`${AUTH_BASE}token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
    .then(data => data.json())
}

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

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
    localStorage.setItem('accessToken', data.access);
    return data.access;

  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};


export const getImage = async (imagePath) => {
  const accessToken = localStorage.getItem('accessToken');
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  try {
    const response = await fetch(imagePath, requestOptions);
    if (!response.ok) {
      if (response.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshToken().then(newAccessToken => {
            localStorage.setItem('accessToken', newAccessToken);
            isRefreshing = false;
            return getImage(imagePath);
          }).catch(error => {
            isRefreshing = false;
            console.error('Error refreshing token:', error);
            throw error;
          });
        }
        await refreshPromise;
        return getImage(imagePath);
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    return imageUrl;
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

export const get = async (url) => {
  return request(url, 'GET');
};

export const post = async (url, data) => {
  return request(url, 'POST', data);
};

export const put = async (url, data) => {
  return request(url, 'PUT', data);
};

export const del = async (url) => {
  return request(url, 'DELETE');
};
