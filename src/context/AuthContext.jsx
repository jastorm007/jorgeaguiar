import { createContext, useContext, useEffect, useState } from "react";
import { saveToken, clearToken, getToken } from "../utils/token";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_BASE = "https://sorpentor.com";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(true);

  const loginWithToken = (newToken) => {
    saveToken(newToken);
    setToken(newToken);
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch {
      // ignore
    }

    clearToken();
    setToken(null);
  };

  // 🔥 RENAMED
  const refreshAccessToken = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include"
      });

      if (!res.ok) throw new Error("Refresh failed");

      const data = await res.json();

      if (data?.token) {
        saveToken(data.token);
        setToken(data.token);
        return data.token;
      }

      throw new Error("No token returned");
    } catch {
      clearToken();
      setToken(null);
      return null;
    }
  };

  useEffect(() => {
    async function initAuth() {
      if (!getToken()) {
        await refreshAccessToken();
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        token,
        loginWithToken,
        logout,
        refreshAccessToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
