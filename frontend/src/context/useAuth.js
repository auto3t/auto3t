import { createContext, useContext } from "react";
import useAuthStore from "../stores/AuthStore";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const {accessToken, setAccessToken, setToken, refreshToken} = useAuthStore();
  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, setToken, refreshToken}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
