import { createContext, useContext } from "react";
import useAuthStore from "../stores/AuthStore";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const {accessToken, setAccessToken, refreshToken} = useAuthStore();
  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, refreshToken}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
