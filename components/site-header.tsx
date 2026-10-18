import Link from "next/link";

const links = [
  ["/portfolio/projects/", "Projects"],
  ["/about/", "About"],
  ["/assets/diamond-brown-resume.pdf", "Resume"],
  ["/contact/", "Contact"],
] as const;

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
          <Link className="brand" href="/" aria-label="Diamond Brown portfolio home">
            <img src="/assets/brandmark.png" alt="" width="66" height="66" />
            <span>Diamond Brown<small>Software Development &amp; Systems</small></span>
          </Link>
          <nav className="links" aria-label="Portfolio navigation">
            {links.map(([href, label]) => (
                <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
