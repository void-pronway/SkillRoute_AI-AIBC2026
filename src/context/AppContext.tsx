"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TRANSLATIONS, toBengaliNumber, formatNumber, getTranslation } from "@/lib/i18n";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  bio?: string;
  studentProfile?: any;
  orgMemberships?: any[];
}

interface AppContextType {
  lang: "en" | "bn";
  setLang: (lang: "en" | "bn") => void;
  toggleLang: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  isLoadingUser: boolean;
  refreshUser: () => Promise<void>;
  t: (key: string, params?: Record<string, any>) => string;
  fmtNum: (num: number | string | null | undefined) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // First-time visitors default to Bangla as specified in blueprint
  const [lang, setLangState] = useState<"en" | "bn">("bn");
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    // Read persisted language preference from localStorage
    const savedLang = localStorage.getItem("sr_lang") as "en" | "bn";
    if (savedLang === "en" || savedLang === "bn") {
      setLangState(savedLang);
    } else {
      setLangState("bn"); // default
    }

    // Read persisted theme preference
    const savedTheme = localStorage.getItem("sr_theme") as "light" | "dark";
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    // Fetch active session user
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      setIsLoadingUser(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const setLang = (newLang: "en" | "bn") => {
    setLangState(newLang);
    localStorage.setItem("sr_lang", newLang);
  };

  const toggleLang = () => {
    setLang(lang === "bn" ? "en" : "bn");
  };

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    localStorage.setItem("sr_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const t = (key: string, params: Record<string, any> = {}) => {
    return getTranslation(key, lang, params);
  };

  const fmtNum = (num: number | string | null | undefined) => {
    return formatNumber(num, lang);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        theme,
        setTheme,
        toggleTheme,
        user,
        setUser,
        isLoadingUser,
        refreshUser,
        t,
        fmtNum,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
