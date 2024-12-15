import { create } from "zustand";

export type TokenResponseType = {
  access: string
  refresh: string
}

interface AuthStoreInterface {
  accessToken: string | null
  refreshToken: string | null
  setAccessToken: (newAccessToken: string) => void;
  setRefreshToken: (newRefreshToken: string) => void;
  setToken: (tokenResponse: TokenResponseType) => void;
  logout: () => void;
}

const useAuthStore = create<AuthStoreInterface>((set) => ({
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
