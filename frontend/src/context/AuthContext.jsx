"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken } from "@/src/utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetchMe().then((currentUser) => {
      if (!active) return;
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const forgetPassword = useCallback(async (email) => {
    const res = await api.post("/auth/forget-password", { email });
    return res.data;
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    const res = await api.post("/auth/reset-password", { token, newPassword });
    return res.data;
  }, []);

  const verifyEmail = useCallback(async (token) => {
    const res = await api.post("/auth/verify-email", { token });
    return res.data;
  }, []);

  const resendVerification = useCallback(async (email) => {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  }, []);

  const register = useCallback((payload) => api.post("/auth/register", payload), []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
      router.replace("/login");
    }
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      forgetPassword,
      resetPassword,
      verifyEmail,
      resendVerification,
    }),
    [user, isLoading, login, register, logout, forgetPassword, resetPassword, verifyEmail, resendVerification]
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
