"use client";

import { useCallback, useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";

function applyTheme(mode: Mode) {
  const root = document.documentElement;
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const systemDark = mql.matches;
  const wantDark = mode === "dark" || (mode === "system" && systemDark);

  root.classList.toggle("dark", wantDark);
  root.setAttribute("data-theme", mode);
  root.style.colorScheme = wantDark ? "dark" : "light";
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>("system");

  // Initialize from localStorage (or default to 'system')
  useEffect(() => {
    setMounted(true);
    try {
      const stored = (localStorage.getItem("theme") as Mode | null) ?? "system";
      setMode(stored);
      applyTheme(stored);
    } catch {}
  }, []);

  // When in "system" mode, track OS changes and update live
  useEffect(() => {
    if (!mounted) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (mode === "system") applyTheme("system");
    };
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [mounted, mode]);

  const setAndPersist = useCallback((next: Mode) => {
    setMode(next);
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg border border-zinc-300 bg-white/80 p-1 text-sm text-zinc-900 backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100">
      <button
        type="button"
        onClick={() => setAndPersist("light")}
        className={
          "rounded-md px-2 py-1 " +
          (mode === "light"
            ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
            : "hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70")
        }
        aria-pressed={mode === "light"}
      >
        ☀️ Light
      </button>
      <button
        type="button"
        onClick={() => setAndPersist("dark")}
        className={
          "rounded-md px-2 py-1 " +
          (mode === "dark"
            ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
            : "hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70")
        }
        aria-pressed={mode === "dark"}
      >
        🌙 Dark
      </button>
      <button
        type="button"
        onClick={() => setAndPersist("system")}
        className={
          "rounded-md px-2 py-1 " +
          (mode === "system"
            ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
            : "hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70")
        }
        aria-pressed={mode === "system"}
      >
        🖥️ System
      </button>
    </div>
  );
}