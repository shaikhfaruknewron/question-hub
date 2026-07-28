"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken } from "@/src/utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      // Not signed in (or the session expired) — both are normal on first load.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback((payload) => api.post("/auth/register", payload), []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      // Clear locally even if the server call fails, otherwise the UI gets stuck.
      setAccessToken(null);
      setUser(null);
      router.replace("/login");
    }
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshUser: loadUser }),
    [user, isLoading, login, register, logout, loadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
