/**
 * Build-time opt-in for the site-wide redesign (#131).
 *
 * Every generated page except the social-profile home ("/" and its
 * "/portfolio/" alias) receives the same profile-style top bar, the `rd` body
 * class that scopes redesign.css, and the progressive-enhancement script. The
 * top bar lives here, not in each source page, so navigation and its active
 * state cannot drift between pages.
 */

/** Routes that keep the social-profile design untouched. */
export const PROFILE_ROUTES = new Set(["/", "/portfolio/"]);

/**
 * Primary navigation, in display order: [href, label, isActive(route)]. It keeps
 * the pre-redesign destinations (Projects, About, Résumé, Contact) and adds Home;
 * career pages under /work/ are reached from the profile and Projects pages.
 */
const NAV_LINKS = [
  ["/", "Home", () => false],
  ["/portfolio/projects/", "Projects", (route) => route.startsWith("/portfolio/projects/")],
  ["/about/", "About", (route) => route === "/about/"],
  ["/assets/diamond-brown-resume.pdf", "Résumé", () => false],
  ["/contact/", "Contact", (route) => route === "/contact/" || route === "/contacts/"],
];

/**
 * Renders the shared top bar for a route. The avatar links home, so phones may
 * hide the text Home link (see redesign.css); the active link gets
 * aria-current="page".
 */
export function renderTopBar(route) {
  const links = NAV_LINKS.map(([href, label, isActive]) =>
    `<a href="${href}"${isActive(route) ? ' aria-current="page"' : ""}>${label}</a>`,
  ).join("");
  return `<header><div class="rd-topbar"><a class="rd-handle" href="/" aria-label="Diamond Brown portfolio home"><img src="/assets/profile-avatar-320.jpg" alt="" width="36" height="36"><span>diamond.brown</span></a><nav class="rd-links" aria-label="Portfolio navigation">${links}</nav></div></header>`;
}

/**
 * Renders the shared footer. Projects and Contact are omitted — the top bar
 * covers primary nav. DevWiki and Résumé serve as utility/secondary links.
 */
export function renderFooter() {
  return `<footer class="footer"><div class="wrap"><div class="footer-brand"><img src="/assets/brandmark.png" alt="" width="45" height="45"><span>© 2026 GemsForge</span></div><nav aria-label="Footer navigation"><a href="https://www.gemsforge.com/knowledge">DevWiki</a><a href="#main">Back to top ↑</a></nav></div></footer>`;
}

/**
 * Applies the redesign shell to one generated page. Idempotent: pages whose
 * source already links the stylesheet or script are not given duplicates.
 *
 * @param {string} html Generated page HTML.
 * @param {string} route Route the page is served at.
 * @returns {string} HTML with the redesign shell, or the input for profile routes.
 */
export function applySiteRedesign(html, route) {
  if (PROFILE_ROUTES.has(route)) return html;
  let text = html.replace(/<header>[\s\S]*?<\/header>/, renderTopBar(route));
  text = text.replace(/<footer[\s\S]*?<\/footer>/, renderFooter());
  if (!text.includes("/assets/redesign.css")) {
    text = text.replace("</head>", '<link rel="stylesheet" href="/assets/redesign.css"></head>');
  }
  if (!text.includes("/assets/projects-redesign.js")) {
    text = text.replace("</head>", '<script src="/assets/projects-redesign.js" defer></script></head>');
  }
  return text.replace(/<body(?: class="([^"]*)")?>/, (_match, classes = "") => {
    const list = new Set(classes.split(/\s+/).filter(Boolean));
    list.add("rd");
    return `<body class="${[...list].join(" ")}">`;
  });
}
