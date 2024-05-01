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

  const resetTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
  }

  return {
    setToken: saveToken,
    accessToken: accessToken,
    refreshToken: refreshToken,
    resetTokens: resetTokens,
  }
}
