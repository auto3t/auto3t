import { useState } from "react";

export default function useToken() {

  const getAccessToken = () => {
    const accessToken = localStorage.getItem('accessToken');
    return accessToken;
  }
  const getRefreshToken = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return refreshToken
  }

  const [accessToken, setAccessToken] = useState(getAccessToken());
  const [refreshToken, setRefreshToken] = useState(getRefreshToken());

  const saveToken = tokenResponse => {
    localStorage.setItem('accessToken', tokenResponse.access);
    localStorage.setItem('refreshToken', tokenResponse.refresh);
    setAccessToken(tokenResponse.access);
    setRefreshToken(tokenResponse.refresh);
  }

  return {
    setToken: saveToken,
    accessToken: accessToken,
    refreshToken: refreshToken,
  }
}
