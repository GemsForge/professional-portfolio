/** Adds the public Developer Library link to a static page's primary header. */
export function addDeveloperLibraryNavigation(html, route) {
  const navigationPattern = /(<nav class="links" aria-label="Portfolio navigation">)([\s\S]*?)(<\/nav>)/;
  const navigation = html.match(navigationPattern);
  if (!navigation) throw new Error(`Missing portfolio header navigation in ${route}`);
  if (navigation[2].includes('href="/knowledge/"')) return html;
  return html.replace(navigationPattern, (_match, opening, links, closing) =>
    `${opening}${links.replace(/<\/a>/, '</a><a href="/knowledge/">Knowledge</a>')}${closing}`,
  );
}
