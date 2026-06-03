"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export type Theme = "midnight" | "sunny";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "notion-templates-theme";

/* ============================================
   Sunny 主题 CSS 变量值
   ============================================ */
const SUNNY_VARS: Record<string, string> = {
  /* Tailwind 颜色 */
  "--theme-midnight": "#fef9ef",
  "--theme-midnight-light": "#faf3e6",
  "--theme-dark-purple": "#f5ecd7",
  "--theme-cosmic": "#ffffff",
  "--theme-cosmic-light": "#faf7f0",
  "--theme-lavender": "#e8943a",
  "--theme-lavender-light": "#f0b86c",
  "--theme-silver": "#3d3530",

  /* 限免/会员标签 — 红色 */
  "--color-amber-300": "#f87171",
  "--color-amber-400": "#ef4444",

  /* 渐变 */
  "--theme-gradient-body":
    "linear-gradient(135deg, #fef9ef 0%, #faf3e6 50%, #fef5e1 100%)",
  "--theme-gradient-text":
    "linear-gradient(135deg, #e8943a 0%, #f0b86c 50%, #d4782a 100%)",

  /* 玻璃拟态 */
  "--theme-glass-bg": "rgba(255, 255, 255, 0.75)",
  "--theme-glass-border": "rgba(200, 180, 160, 0.35)",

  /* 滚动条 */
  "--theme-scrollbar-track": "#faf3e6",
  "--theme-scrollbar-thumb": "#d4c4a8",
  "--theme-scrollbar-thumb-hover": "#b89868",

  /* 星光 */
  "--theme-stars":
    "radial-gradient(1px 1px at 20% 30%, rgba(232,148,58,0.3), transparent), " +
    "radial-gradient(1px 1px at 40% 70%, rgba(180,150,100,0.2), transparent), " +
    "radial-gradient(1px 1px at 60% 20%, rgba(232,148,58,0.2), transparent), " +
    "radial-gradient(1px 1px at 80% 50%, rgba(180,150,100,0.15), transparent), " +
    "radial-gradient(1px 1px at 10% 80%, rgba(232,148,58,0.2), transparent), " +
    "radial-gradient(1.5px 1.5px at 50% 10%, rgba(180,150,100,0.25), transparent), " +
    "radial-gradient(1px 1px at 90% 90%, rgba(232,148,58,0.2), transparent)",
};

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "midnight" || stored === "sunny") return stored;
  return null;
}

function applySunnyVars() {
  const root = document.documentElement;
  Object.entries(SUNNY_VARS).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

function removeSunnyVars() {
  const root = document.documentElement;
  Object.keys(SUNNY_VARS).forEach((key) => {
    root.style.removeProperty(key);
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("midnight");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    const initial = stored || "midnight";
    setThemeState(initial);
    if (initial === "sunny") {
      applySunnyVars();
    }
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (next === "sunny") {
      applySunnyVars();
    } else {
      removeSunnyVars();
    }
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "midnight" ? "sunny" : "midnight";
      if (next === "sunny") {
        applySunnyVars();
      } else {
        removeSunnyVars();
      }
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
