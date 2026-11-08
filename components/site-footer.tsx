// Intentional: use browser navigation because client-side route transitions are failing.
/* eslint-disable @next/next/no-html-link-for-pages */
import Image from "next/image";

/**
 * Renders the single site-wide footer navigation with native anchors so
 * navigation remains reliable without client-side router hydration.
 *
 * Keeping this in the shared shell ensures every React view exposes the same
 * project, resume, contact, admin, Dev Wiki, and back-to-top links.
 */
export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-brand">
          <Image src="/assets/brandmark.png" alt="" width={45} height={45} />
          <span>© 2026 Diamond Brown · GemsForge</span>
        </div>
        <nav aria-label="Footer navigation">
          <a href="/portfolio/projects/">Projects</a>
          <a href="/assets/diamond-brown-resume.pdf">Resume</a>
          <a href="/contact/">Contact</a>
          <a href="/admin/">Admin</a>
          <a href="/knowledge/">Dev Wiki</a>
          <a href="#main">Back to top ↑</a>
        </nav>
      </div>
    </footer>
  );
}
