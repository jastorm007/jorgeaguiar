import { createContext, useContext, useEffect, useState } from "react";
import { saveToken, clearToken, getToken } from "../utils/token";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_BASE = "https://sorpentor.com"; // adjust if needed

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(true);

  /* ============================
     LOGIN WITH ACCESS TOKEN
  ============================ */
  const loginWithToken = (newToken) => {
    saveToken(newToken);
    setToken(newToken);
  };

  /* ============================
     LOGOUT
  ============================ */
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.warn("Logout request failed");
    }

    clearToken();
    setToken(null);
  };

  /* ============================
     REFRESH ACCESS TOKEN
  ============================ */
  const refreshToken = async () => {
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
    } catch (err) {
      clearToken();
      setToken(null);
      return null;
    }
  };

  /* ============================
     INITIAL LOAD (SILENT REFRESH)
  ============================ */
  useEffect(() => {
    async function initAuth() {
      const existing = getToken();

      if (!existing) {
        // try refresh anyway (cookie-based)
        await refreshToken();
      }

      setLoading(false);
    }

    initAuth();
  }, []);

  if (loading) {
    return null; // or loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        loginWithToken,
        logout,
        refreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
