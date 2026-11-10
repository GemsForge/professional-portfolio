/**
 * Build-time metadata for public portfolio pages: social link previews,
 * robots.txt, and sitemap.xml. Every function is pure so tests can exercise
 * them without running the full page build.
 */

/** Production origin used for absolute URLs in previews and the sitemap. */
export const SITE_ORIGIN = "https://www.gemsforge.com";

/** Square portrait used as the default preview image (1200×1200). */
export const SOCIAL_IMAGE = {
  path: "/assets/profile-photo.jpg",
  width: 1200,
  height: 1200,
  alt: "Diamond Brown smiling at the camera.",
};

/**
 * Legacy routes that redirect elsewhere. They stay out of the sitemap; the
 * worker owns the actual redirect.
 */
export const LEGACY_REDIRECTS = { "/contacts/": "/contact/" };

const escapeAttribute = (value) =>
  value
    .replace(/&(?!(?:[a-z]+|#\d+|#x[0-9a-f]+);)/gi, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const decodeTitle = (value) => value.replace(/&amp;/g, "&").trim();

/**
 * Adds Open Graph and Twitter card tags to one page.
 *
 * Reads the page's existing `<title>`, meta description, and canonical link,
 * so those remain the single source of truth. Adds a canonical link when it is
 * missing. Pages that already declare `og:title` are returned unchanged, which
 * keeps the build idempotent.
 *
 * @param {string} html Complete page HTML.
 * @param {string} route Site-relative route such as `/about/`.
 * @returns {string} HTML with the preview tags inserted before `</head>`.
 */
export function applySocialMetadata(html, route) {
  if (/property="og:title"/.test(html) || !html.includes("</head>")) return html;

  const title = decodeTitle(/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "Diamond Brown");
  const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "";
  const canonical = /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1];
  const url = canonical ?? `${SITE_ORIGIN}${route}`;
  const image = `${SITE_ORIGIN}${SOCIAL_IMAGE.path}`;

  const tags = [
    canonical ? "" : `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="${route === "/" ? "website" : "article"}">`,
    `<meta property="og:site_name" content="Diamond Brown · GemsForge">`,
    `<meta property="og:title" content="${escapeAttribute(title)}">`,
    description ? `<meta property="og:description" content="${description}">` : "",
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:width" content="${SOCIAL_IMAGE.width}">`,
    `<meta property="og:image:height" content="${SOCIAL_IMAGE.height}">`,
    `<meta property="og:image:alt" content="${escapeAttribute(SOCIAL_IMAGE.alt)}">`,
    // A square portrait suits the compact card better than a cropped large one.
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${escapeAttribute(title)}">`,
    description ? `<meta name="twitter:description" content="${description}">` : "",
    `<meta name="twitter:image" content="${image}">`,
  ].join("");

  return html.replace("</head>", `${tags}</head>`);
}

/**
 * Lists the routes that belong in the sitemap: every prepared public page
 * except legacy redirects. Admin and API routes are never prepared pages.
 *
 * @param {string[]} routes Prepared page routes.
 * @returns {string[]} Sorted public routes.
 */
export function sitemapRoutes(routes) {
  return routes.filter((route) => !(route in LEGACY_REDIRECTS)).sort();
}

/**
 * @param {string[]} routes Prepared page routes.
 * @returns {string} sitemap.xml contents.
 */
export function renderSitemap(routes) {
  const urls = sitemapRoutes(routes)
    .map((route) => `  <url><loc>${SITE_ORIGIN}${route}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * Blocks the owner workspace and APIs from crawlers and points them at the
 * sitemap. Authorization still protects those routes; this only avoids noise.
 *
 * @returns {string} robots.txt contents.
 */
export function renderRobots() {
  return `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;
}
