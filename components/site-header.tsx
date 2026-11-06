// Intentional: use browser navigation because client-side route transitions are failing.
/* eslint-disable @next/next/no-html-link-for-pages */
import Image from "next/image";

const links = [
  ["/portfolio/projects/", "Projects"],
  ["/knowledge/", "Knowledge"],
  ["/about/", "About"],
  ["/assets/diamond-brown-resume.pdf", "Resume"],
  ["/contact/", "Contact"],
] as const;

/**
 * Renders the single site-wide header and primary navigation with native
 * anchors so route changes do not depend on client-side router hydration.
 *
 * The pathname is supplied by the catch-all route so nested project pages can
 * keep Projects active without duplicating navigation markup in each view.
 */
export function SiteHeader({ pathname }: { pathname: string }) {
  const isActive = (href: string) =>
    href === "/portfolio/projects/"
      ? pathname.startsWith("/portfolio/projects/")
      : pathname === href;

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header>
        <div className="wrap nav">
          <a className="brand" href="/" aria-label="Diamond Brown portfolio home">
            <Image src="/assets/brandmark.png" alt="" width={66} height={66} />
            <span>Diamond Brown<small>Software Development &amp; Systems</small></span>
          </a>
          <nav className="links" aria-label="Portfolio navigation">
            {links.map(([href, label]) => (
                <a key={href} href={href} aria-current={isActive(href) ? "page" : undefined}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
