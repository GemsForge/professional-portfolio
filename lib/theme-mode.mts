/**
 * Theme-toggle rules shared by the React `ThemeToggle` and covered by
 * `tests/theme-toggle.test.mjs`. `static-source/assets/theme.js` is served as a
 * plain script and cannot import this, so it keeps its own copy; the same test
 * runs that script and fails if the two disagree.
 */

/** The visitor's theme setting. `system` follows the OS and stores nothing. */
export type ThemeMode = "system" | "light" | "dark";

/** Display names used in the toggle's accessible label. */
export const THEME_LABELS: Record<ThemeMode, string> = { system: "System", light: "Light", dark: "Dark" };

/**
 * Returns the setting a click moves to. The cycle always starts by flipping
 * the visible theme (system → opposite of the OS → same as the OS → system),
 * so the first click from the default never looks like a no-op.
 * @param mode - The current setting.
 * @param osDark - Whether the OS currently prefers a dark color scheme.
 */
export function nextMode(mode: ThemeMode, osDark: boolean): ThemeMode {
  const opposite: ThemeMode = osDark ? "light" : "dark";
  const matching: ThemeMode = osDark ? "dark" : "light";
  if (mode === "system") return opposite;
  return mode === opposite ? matching : "system";
}

/**
 * Builds the toggle's accessible label, naming the current setting (and the
 * OS theme it resolves to under System) and the setting a click switches to.
 */
export function themeLabel(mode: ThemeMode, osDark: boolean): string {
  const resolved = mode === "system" ? ` (${osDark ? "dark" : "light"})` : "";
  return `Theme: ${THEME_LABELS[mode]}${resolved}. Switch to ${THEME_LABELS[nextMode(mode, osDark)]}`;
}
