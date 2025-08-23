"use client";

import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");

  // hydrate from storage / system once
  useEffect(() => {
    setMounted(true);
    try {
      const stored = (localStorage.getItem("theme") as Theme) || "system";
      applyTheme(stored);
    } catch {
      applyTheme("system");
    }
    // close menu on ESC
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const applyTheme = useCallback((t: Theme) => {
    setTheme(t);
    const root = document.documentElement;
    if (t === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
      root.dataset.theme = prefersDark ? "dark" : "light";
      try { localStorage.removeItem("theme"); } catch {}
    } else {
      root.classList.toggle("dark", t === "dark");
      root.dataset.theme = t;
      try { localStorage.setItem("theme", t); } catch {}
    }
  }, []);

  if (!mounted) return null;

  // simple icon glyphs
  const Icon = ({ name }: { name: Theme }) => (
    <span aria-hidden className="text-base">
      {name === "light" ? "☀️" : name === "dark" ? "🌙" : "🖥️"}
    </span>
  );

  return (
    <>
      {/* FAB – bigger, high-contrast button */}
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={() => setOpen(v => !v)}
        className="
          fixed z-50 right-4
          bottom-[calc(env(safe-area-inset-bottom)+16px)]
          h-11 w-11 rounded-full
          shadow-lg ring-1 ring-zinc-900/10 dark:ring-zinc-50/10
          bg-white/90 text-zinc-900
          dark:bg-zinc-900/90 dark:text-zinc-100
          supports-[backdrop-filter]:backdrop-blur
          flex items-center justify-center
          active:scale-[0.98] transition
        "
      >
        <Icon name={theme} />
      </button>

      {/* Popover menu */}
      {open && (
        <div
          role="menu"
          className="
            fixed z-50 right-4
            bottom-[calc(env(safe-area-inset-bottom)+72px)]
            min-w-44 rounded-xl p-1
            shadow-xl ring-1 ring-zinc-900/10 dark:ring-zinc-50/10
            bg-white/95 dark:bg-zinc-900/95
            supports-[backdrop-filter]:backdrop-blur
          "
        >
          {(["light", "dark", "system"] as Theme[]).map((t) => {
            const active = theme === t || (theme === "system" && t === "system");
            return (
              <button
                role="menuitemradio"
                aria-checked={active}
                key={t}
                onClick={() => { applyTheme(t); setOpen(false); }}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm
                  flex items-center gap-2
                  ${active
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }
                `}
              >
                <Icon name={t} />
                {t === "light" ? "Light" : t === "dark" ? "Dark" : "System"}
              </button>
            );
          })}
        </div>
      )}

      {/* Backdrop click area */}
      {open && (
        <button
          aria-label="Close theme menu"
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}