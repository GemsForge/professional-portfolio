"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/** localStorage key shared with the pre-paint boot script in `app/layout.tsx`. */
export const THEME_STORAGE_KEY = "gf-theme";

/** Reads the theme in effect: an explicit `data-theme` choice, else the OS preference. */
function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Switches the site between light and dark themes. Until the visitor chooses,
 * the site follows the OS setting; a choice is stored and applied as
 * `data-theme` on `<html>`, which the theme tokens in `site.css` key off.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(currentTheme());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const follow = () => { if (!document.documentElement.dataset.theme) setTheme(currentTheme()); };
    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";
  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch { /* Storage can be blocked; the choice still applies to this page. */ }
    setTheme(next);
  };

  return (
    <button className="sp-theme-toggle" type="button" onClick={toggle} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
      )}
    </button>
  );
}
