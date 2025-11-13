// src/components/ThemeToggle.tsx
import { useEffect, useState } from "react";

export default function ThemeToggle({ fixed = false }: { fixed?: boolean }) {
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true
  );

  // Inicializa desde localStorage o preferencia del SO
  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("treke_theme");
    const desired =
      saved === "dark" || saved === "light"
        ? saved
        : window.matchMedia?.("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    root.classList.toggle("dark", desired === "dark");
    setIsDark(desired === "dark");
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = !isDark;
    root.classList.toggle("dark", next);
    localStorage.setItem("treke_theme", next ? "dark" : "light");
    setIsDark(next);
  };

  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors " +
    (isDark
      ? "bg-neutral-900/80 text-neutral-100 border-neutral-700 hover:bg-neutral-800"
      : "bg-white/90 text-neutral-900 border-neutral-300 hover:bg-neutral-100");

  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={(fixed ? "fixed top-4 right-4 z-50 " : "") + base}
    >
      <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline">{isDark ? "Oscuro" : "Claro"}</span>
    </button>
  );
}
