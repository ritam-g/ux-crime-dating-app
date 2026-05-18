/**
 * @file AuthContext.jsx
 * @description Stores the authenticated user and auth actions for the app with production-ready stability.
 */
import { createContext, useContext, useEffect, useState } from "react";
import {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/api.js";
import { connectSocket, disconnectSocket } from "../services/socket.js";

const AuthContext = createContext(null);

const safeUser = (user) => user || null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("loveexe_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  
  // If we have a cached user, we can assume authenticated on first load to prevent flash/layout shifts.
  // We'll still silently verify in the background.
  const [loading, setLoading] = useState(() => !localStorage.getItem("loveexe_user"));

  const syncSession = async () => {
    try {
      const response = await getProfile();
      const userData = safeUser(response.user);
      setUser(userData);
      if (userData) {
        localStorage.setItem("loveexe_user", JSON.stringify(userData));
      } else {
        localStorage.removeItem("loveexe_user");
      }
    } catch (err) {
      // ONLY log out and clear cookie session if server explicitly says 401 Unauthorized or 403 Forbidden
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setUser(null);
        localStorage.removeItem("loveexe_user");
      }
      // If it's a network glitch or a 500 error, we keep our cached state!
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncSession();
  }, []);

  useEffect(() => {
    if (user) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [user]);

  const login = async (payload) => {
    const response = await loginUser(payload);
    const userData = safeUser(response.user);
    setUser(userData);
    if (userData) {
      localStorage.setItem("loveexe_user", JSON.stringify(userData));
    }
    return response;
  };

  const register = async (payload) => {
    const response = await registerUser(payload);
    const userData = safeUser(response.user);
    setUser(userData);
    if (userData) {
      localStorage.setItem("loveexe_user", JSON.stringify(userData));
    }
    return response;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Local logout clean-up proceeding despite network error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("loveexe_user");
    }
  };

  const refreshUser = async () => {
    try {
      const response = await getProfile();
      const userData = safeUser(response.user);
      setUser(userData);
      if (userData) {
        localStorage.setItem("loveexe_user", JSON.stringify(userData));
      }
      return userData;
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setUser(null);
        localStorage.removeItem("loveexe_user");
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

