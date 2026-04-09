"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, ApiError } from "./api";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string | null;
  business_name: string | null;
  brand_color: string;
  tier: string;
  onboarded: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: () => {},
});

const PUBLIC_PATHS = ["/", "/login", "/auth/verify", "/compare"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refresh = async () => {
    try {
      const u = await api.get<User>("/auth/me");
      setUser(u);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    document.cookie = "session=; path=/; max-age=0";
    setUser(null);
    router.push("/login");
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.includes(pathname) ||
      pathname.startsWith("/p/") ||
      pathname.startsWith("/c/") ||
      pathname.startsWith("/i/") ||
      pathname.startsWith("/portal/");

    if (!user && !isPublic) {
      router.push("/login");
    } else if (user && user.onboarded === 0 && pathname !== "/onboard") {
      router.push("/onboard");
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
