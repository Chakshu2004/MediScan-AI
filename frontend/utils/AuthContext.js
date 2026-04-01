/**
 * utils/AuthContext.js
 * React context that wraps authentication state + actions.
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { getMe, clearTokens, isAuthenticated } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const router                = useRouter();

  const fetchUser = useCallback(async () => {
    if (!isAuthenticated()) { setLoading(false); return; }
    try {
      const { data } = await getMe();
      setUser(data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
