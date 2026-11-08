import pages from "@/lib/static-pages.json";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ProjectCardGrid } from "@/components/project-card";
import { HOME_PROJECT_SLUGS } from "@/scripts/project-catalog.mts";

const projectGridMarker = "<!--PROJECT_CARD_GRID-->";

function cleanPage(html: string) {
  return html
    .replace(/<header>[\s\S]*?<\/header>/i, "")
    .replace(/<footer[\s\S]*?<\/footer>/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!doctype html>/i, "")
    .replace(/<html[^>]*>|<\/html>|<head>[\s\S]*?<\/head>|<body[^>]*>|<\/body>|<main\b[^>]*>|<\/main>/gi, "")
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
  const isHome = pathname === "" || pathname === "/" || pathname === "/index.html" || pathname === "/portfolio/";
  const hasProjectGrid = isHome || pathname === "/portfolio/projects/";
  const content = isHome
    ? cleanPage(page).replace(/<section id="work">[\s\S]*?<\/section>/, projectGridMarker)
    : cleanPage(page).replace(
        /<div class="projects">[\s\S]*?<\/div>(?=<\/div><\/section>)/,
        hasProjectGrid ? projectGridMarker : "",
      );
  const [beforeGrid, afterGrid] = content.split(projectGridMarker);
  return (
    <>
      <SiteHeader pathname={pathname} />
      {/* Scope recruiter profile refinements to the homepage without changing shared subpage styles. */}
      <main
        id="main"
        className={isHome ? "home-profile" : pathname === "/work/" ? "experience-landing" : undefined}
      >
        <div dangerouslySetInnerHTML={{ __html: beforeGrid }} />
        {isHome ? (
          <section id="work">
            <div className="wrap">
              <div className="sectionhead">
                <div>
                  <h2>Selected projects</h2>
                </div>
                <p>
                  Independent work demonstrating application development, systems design, and practical automation.
                </p>
              </div>
              <ProjectCardGrid
                slugs={[...HOME_PROJECT_SLUGS]}
                showMoreLink
              />
            </div>
          </section>
        ) : hasProjectGrid ? (
          <ProjectCardGrid />
        ) : null}
        <div dangerouslySetInnerHTML={{ __html: afterGrid ?? "" }} />
      </main>
      <SiteFooter />
    </>
  );
}
