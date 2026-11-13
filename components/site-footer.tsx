// Intentional: use browser navigation because client-side route transitions are failing.
/* eslint-disable @next/next/no-html-link-for-pages */
import Image from "next/image";

/**
 * Renders the single site-wide footer navigation with native anchors so
 * navigation remains reliable without client-side router hydration.
 *
 * Keeps the Admin link and contextual Portfolio/Wiki toggle while matching the
 * creator-footer treatment used on the homepage.
 */
export function SiteFooter({ wikiMode = false }: { /** Marks Wiki views that link back to the Portfolio. */ wikiMode?: boolean }) {
  return (
    <footer className="footer creator-footer">
      <div className="wrap">
        <div className="footer-brand">
          <Image src="/assets/brandmark.png" alt="" width={45} height={45} />
          <span>© 2026 Diamond Brown · GemsForge</span>
        </div>
        <nav aria-label="Footer navigation">
          <a href="/portfolio/projects/">All project stories</a>
          <a href="/about/">About</a>
          <a href="/assets/diamond-brown-resume.pdf">Résumé</a>
          <a href="/admin/">Admin</a>
          <a href={wikiMode ? "/" : "/knowledge/"}>{wikiMode ? "Portfolio" : "Dev Wiki"}</a>
        </nav>
      </div>
    </footer>
  );
}
