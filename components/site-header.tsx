// Intentional: use browser navigation because client-side route transitions are failing.
/* eslint-disable @next/next/no-html-link-for-pages */

const links = [
  ["/portfolio/projects/", "Projects"],
  ["/about/", "About"],
  ["/assets/diamond-brown-resume.pdf", "Résumé"],
  ["/contact/", "Contact"],
] as const;

/**
 * Renders the single site-wide header and primary navigation with native
 * anchors so route changes do not depend on client-side router hydration.
 *
 * The pathname is supplied by the catch-all route so nested project pages can
 * keep Projects active and wiki pages can return to the portfolio.
 */
export function SiteHeader({ pathname, handbookReader = false }: {
  /** Route used to determine the active primary navigation item. */
  pathname: string;
  /** Shows a Portfolio return link on public knowledge pages. */
  handbookReader?: boolean;
}) {
  const isActive = (href: string) =>
    href === "/portfolio/projects/"
      ? pathname.startsWith("/portfolio/projects/")
      : pathname === href;

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="sp-topbar">
        <nav className="sp-topbar-inner" aria-label="Portfolio navigation">
          <a className="sp-handle" href="/" aria-label="Diamond Brown portfolio home">diamond.brown</a>
          <div className="sp-topbar-links">
            {links.map(([href, label]) => (
              <a key={href} href={href} aria-current={isActive(href) ? "page" : undefined}>
                {label}
              </a>
            ))}
            <a href={handbookReader || pathname.startsWith("/knowledge") ? "/" : "/knowledge"}>
              {handbookReader || pathname.startsWith("/knowledge") ? "Portfolio" : "Dev Wiki"}
            </a>
          </div>
        </nav>
      </header>
    </>
  );
}
