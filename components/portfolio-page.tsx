import pages from "@/lib/static-pages.json";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

function cleanPage(html: string) {
  return html
    .replace(/<header>[\s\S]*?<\/header>/i, "")
    .replace(/<footer[\s\S]*?<\/footer>/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!doctype html>/i, "")
    .replace(/<html[^>]*>|<\/html>|<head>[\s\S]*?<\/head>|<body[^>]*>|<\/body>/gi, "")
    .trim();
}

/**
 * Composes a generated static view with the reusable React shell.
 *
 * Static pages remain the source of page content, while their original
 * document shell is removed so header and footer are rendered exactly once.
 */
export function PortfolioPage({ pathname }: { pathname: string }) {
  const page = pages[pathname as keyof typeof pages] ?? pages["/"];
  return (
    <>
      <SiteHeader pathname={pathname} />
      <main id="main" dangerouslySetInnerHTML={{ __html: cleanPage(page) }} />
      <SiteFooter />
    </>
  );
}
