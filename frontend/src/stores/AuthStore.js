import { create } from "zustand";

const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem('accessToken') || null,
  setAccessToken: (newAccessToken) => {
    set({ accessToken: newAccessToken });
    localStorage.setItem('accessToken', newAccessToken);
  },
  refreshToken: localStorage.getItem('refreshToken') || null,
  setRefreshToken: (newRefreshToken) => {
    set({ refreshToken: newRefreshToken });
    localStorage.setItem('refreshToken', newRefreshToken);
  },
  setToken: (tokenResponse) => {
    set({ accessToken: tokenResponse.access, refreshToken: tokenResponse.refresh });
    localStorage.setItem('accessToken', tokenResponse.access);
    localStorage.setItem('refreshToken', tokenResponse.refresh);
  },
  logout: () => {
    set({ accessToken: null, refreshToken: null });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}));

export default useAuthStore;
