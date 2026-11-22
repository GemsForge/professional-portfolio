"use client";

import { useSyncExternalStore } from "react";

/** The visitor's theme setting. `system` follows the OS and stores nothing. */
type ThemeMode = "system" | "light" | "dark";

/** localStorage key shared with the pre-paint boot script in `app/layout.tsx`. */
export const THEME_STORAGE_KEY = "gf-theme";
const THEME_EVENT = "gf-theme-change";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Reads the current setting: an explicit `data-theme` choice, else `system`. */
function currentMode(): ThemeMode {
  const chosen = document.documentElement.dataset.theme;
  return chosen === "light" || chosen === "dark" ? chosen : "system";
}

/**
 * Returns the setting a click moves to. The cycle always starts by flipping
 * the visible theme (system → opposite of the OS → same as the OS → system),
 * so the first click from the default never looks like a no-op.
 * Mirrored in `static-source/assets/theme.js`; keep both in step.
 */
function nextMode(mode: ThemeMode, osDark: boolean): ThemeMode {
  const opposite: ThemeMode = osDark ? "light" : "dark";
  const matching: ThemeMode = osDark ? "dark" : "light";
  if (mode === "system") return opposite;
  return mode === opposite ? matching : "system";
}

/** Snapshot string so React re-renders when either the setting or the OS theme changes. */
function snapshot(): string {
  return `${currentMode()}:${window.matchMedia(DARK_QUERY).matches ? "dark" : "light"}`;
}

/** Re-renders on OS theme changes and on choices made by any toggle on the page. */
function subscribe(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

const LABELS: Record<ThemeMode, string> = { system: "System", light: "Light", dark: "Dark" };

/**
 * Cycles the site theme between System (follow the OS, the default), Light and
 * Dark, and shows the current setting as its icon: a monitor for System, a sun
 * for Light, a moon for Dark. Light/Dark are stored and applied as `data-theme`
 * on `<html>`, which the theme tokens in `site.css` key off; System clears both.
 * Server render has no setting yet, so it shows the System icon until hydration.
 */
export function ThemeToggle() {
  const snap = useSyncExternalStore<string | null>(subscribe, snapshot, () => null);
  const [mode, os] = (snap ?? "system:light").split(":") as [ThemeMode, "light" | "dark"];
  const next = nextMode(mode, os === "dark");
  const label = `Theme: ${LABELS[mode]}${mode === "system" ? ` (${os})` : ""}. Switch to ${LABELS[next]}`;

  const toggle = () => {
    const root = document.documentElement;
    try {
      if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch { /* Storage can be blocked; the choice still applies to this page. */ }
    if (next === "system") delete root.dataset.theme;
    else root.dataset.theme = next;
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button className="sp-theme-toggle" type="button" onClick={toggle} aria-label={label} title={label} data-theme-mode={mode}>
      {mode === "dark" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
      ) : mode === "light" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
      )}
    </button>
  );
}
