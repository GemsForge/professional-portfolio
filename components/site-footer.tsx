import Link from "next/link";
import Image from "next/image";

/**
 * Renders the single site-wide footer navigation.
 *
 * Keeping this in the shared shell ensures every generated view exposes the
 * same project, resume, contact, admin, and back-to-top links.
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
          <Link href="/portfolio/projects/">Projects</Link>
          <Link href="/assets/diamond-brown-resume.pdf">Resume</Link>
          <Link href="/contact/">Contact</Link>
          <Link href="/admin/">Admin</Link>
          <a href="#main">Back to top ↑</a>
        </nav>
      </div>
    </footer>
  );
}
