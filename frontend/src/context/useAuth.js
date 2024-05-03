import { createContext, useContext } from "react";
import useAuthStore from "../stores/AuthStore";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const {accessToken} = useAuthStore();
  return (
    <AuthContext.Provider value={{ accessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
