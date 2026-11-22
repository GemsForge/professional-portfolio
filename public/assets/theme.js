/*
 * Theme for pages served as static HTML (they skip the React SiteHeader).
 * Runs in <head>: applies a stored light/dark choice before first paint, then
 * adds the same three-state (System / Light / Dark) toggle the React
 * ThemeToggle renders. Shares the "gf-theme" key with
 * components/theme-toggle.tsx and app/layout.tsx; System stores nothing.
 */
(function () {
  var KEY = "gf-theme";
  var root = document.documentElement;
  try {
    var stored = localStorage.getItem(KEY);
    if (stored === "light" || stored === "dark") root.dataset.theme = stored;
  } catch { /* Storage can be blocked; the OS setting still applies. */ }

  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var LABELS = { system: "System", light: "Light", dark: "Dark" };
  var ICONS = {
    system: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    light: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>'
  };

  /** The current setting: an explicit data-theme choice, else "system". */
  function mode() {
    var chosen = root.dataset.theme;
    return chosen === "light" || chosen === "dark" ? chosen : "system";
  }

  /** Copy of nextMode in lib/theme-mode.mts (system → opposite of OS → same as OS → system); tests/theme-toggle.test.mjs checks they agree. */
  function nextMode() {
    var opposite = media.matches ? "light" : "dark";
    var matching = media.matches ? "dark" : "light";
    var current = mode();
    if (current === "system") return opposite;
    return current === opposite ? matching : "system";
  }

  /** Shows the icon for the current setting and a label naming the next one. */
  function render(button) {
    var current = mode();
    var label = "Theme: " + LABELS[current] + (current === "system" ? " (" + (media.matches ? "dark" : "light") + ")" : "") + ". Switch to " + LABELS[nextMode()];
    button.innerHTML = ICONS[current];
    button.setAttribute("aria-label", label);
    button.title = label;
    button.dataset.themeMode = current;
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector(".sp-theme-toggle")) return;
    var links = document.querySelector("header .sp-topbar-links, header nav .links, header nav");
    if (!links) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "sp-theme-toggle";
    render(button);
    button.addEventListener("click", function () {
      var next = nextMode();
      try {
        if (next === "system") localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, next);
      } catch { /* Applies to this page only. */ }
      if (next === "system") delete root.dataset.theme;
      else root.dataset.theme = next;
      render(button);
    });
    media.addEventListener("change", function () { render(button); });
    links.appendChild(button);
  });
})();
