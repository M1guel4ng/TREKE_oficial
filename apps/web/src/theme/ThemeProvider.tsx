import { createContext, useContext, useEffect, useState } from "react";
type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | undefined>(undefined);

function getInitial(): Theme {
  const saved = localStorage.getItem("treke_theme");
  if (saved === "dark" || saved === "light") return saved as Theme;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitial);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(theme === "dark" ? "light" : "dark");
    root.classList.add(theme);
    localStorage.setItem("treke_theme", theme);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === "dark" ? "light" : "dark") }}>
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
