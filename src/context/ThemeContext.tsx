import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { getPreferences, savePreferences, type ThemePreference } from "../services/userService";

interface ThemeContextValue {
  theme: ThemePreference;
  toggleTheme: () => void;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): ThemePreference {
  const stored = window.localStorage.getItem("flow-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemePreference>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("flow-theme", theme);
  }, [theme]);

  // Once a user logs in, prefer their saved Firestore preference.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getPreferences(user.uid)
      .then((prefs) => {
        if (!cancelled && prefs.theme) setThemeState(prefs.theme);
      })
      .catch(() => {
        /* fall back silently to local theme */
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => {
        const next = theme === "dark" ? "light" : "dark";
        setThemeState(next);
        if (user) void savePreferences(user.uid, { theme: next });
      },
      setTheme: (next) => {
        setThemeState(next);
        if (user) void savePreferences(user.uid, { theme: next });
      },
    }),
    [theme, user]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
