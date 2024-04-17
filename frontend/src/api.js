// all backend API fetching

const API_BASE = 'http://localhost:8000/api/';

const request = async (url, method, data) => {
  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  };

  if (data) {
    requestOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${url}`, requestOptions);
    if (!response.ok) {
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
