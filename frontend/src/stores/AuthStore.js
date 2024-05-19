import { create } from "zustand";

const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,

  setAccessToken: (newAccessToken) => {
    localStorage.setItem('accessToken', newAccessToken);
    set({ accessToken: newAccessToken });
  },

  setRefreshToken: (newRefreshToken) => {
    localStorage.setItem('refreshToken', newRefreshToken);
    set({ refreshToken: newRefreshToken });
  },

  setToken: (tokenResponse) => {
    localStorage.setItem('accessToken', tokenResponse.access);
    localStorage.setItem('refreshToken', tokenResponse.refresh);
    set({
      accessToken: tokenResponse.access,
      refreshToken: tokenResponse.refresh,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ accessToken: null, refreshToken: null });
  }
}));

export default useAuthStore;
