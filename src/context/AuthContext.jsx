import { createContext, useContext, useState } from "react";
import { saveToken, clearToken, getToken } from "../utils/token";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());

  const loginWithToken = (newToken) => {
    saveToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    clearToken();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
