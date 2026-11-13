/*
 * Theme for pages served as static HTML (they skip the React SiteHeader).
 * Runs in <head>: applies a stored light/dark choice before first paint, then
 * adds the same toggle button the React ThemeToggle renders. Shares the
 * "gf-theme" key with components/theme-toggle.tsx and app/layout.tsx.
 */
(function () {
  var KEY = "gf-theme";
  var root = document.documentElement;
  try {
    var stored = localStorage.getItem(KEY);
    if (stored === "light" || stored === "dark") root.dataset.theme = stored;
  } catch (e) { /* Storage can be blocked; the OS setting still applies. */ }

  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var current = function () { return root.dataset.theme || (media.matches ? "dark" : "light"); };
  var sun = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var moon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';

  /** Shows the icon and label for the theme the button will switch to. */
  function render(button) {
    var dark = current() === "dark";
    var next = dark ? "light" : "dark";
    button.innerHTML = dark ? sun : moon;
    button.setAttribute("aria-label", "Switch to " + next + " mode");
    button.title = "Switch to " + next + " mode";
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
      var next = current() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem(KEY, next); } catch (e) { /* Applies to this page only. */ }
      render(button);
    });
    media.addEventListener("change", function () { render(button); });
    links.appendChild(button);
  });
})();
