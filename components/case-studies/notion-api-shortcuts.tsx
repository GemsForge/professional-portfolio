import { notionApiShortcutsContent, notionApiShortcutsHero as hero } from "../../content/case-studies/notion-api-shortcuts.ts";
import { CaseStudyArticle, RichText } from "./content-blocks.tsx";
import { CaseStudyDocument, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";

/**
 * Layout for the notion-api-shortcuts case study. All page text comes from
 * content/case-studies/notion-api-shortcuts.ts; name, pre-title, lead, and banner
 * image come from the project catalog. The hero mirrors the Aura Logbook header:
 * brand mark beside the title, in-page actions, logo technology chips, and stats.
 */
export function NotionApiShortcutsCaseStudy({ project, projects }: CaseStudyProps) {
  const [firstSlide] = hero.story.slides;
  return (
    <CaseStudyDocument
      project={project}
      description={notionApiShortcutsContent.description}
      stylesheets={["/assets/redesign.css"]}
      scripts={["/assets/projects-redesign.js"]}
      bodyClassName="rd"
    >
      <section className="rd-hero">
        <div className="wrap rd-hero-grid">
          <div className="pagehero">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/portfolio/">Portfolio</a> / <a href="/portfolio/projects/">Projects</a> /{" "}
              <span aria-current="page">{project.name}</span>
            </nav>
            <div className="case-banner aura-case-banner">
              <div>
                <div className="eyebrow">{project.preTitle}</div>
                <div className="case-brand-title">
                  <img src={hero.brandIcon.src} alt={hero.brandIcon.alt} aria-hidden="true" width={hero.brandIcon.width} height={hero.brandIcon.height} />{" "}
                  <h1>{project.name}</h1>
                </div>
                <p className="lead">{project.description}</p>
                <div className="actions case-project-actions">
                  <a className="button" href={hero.primaryLink.href}><RichText text={hero.primaryLink.text} /></a>{" "}
                  <a className="button secondary" href={hero.secondaryLink.href}><RichText text={hero.secondaryLink.text} /></a>
                </div>
                <div className="facts">
                  <div data-dependency-group="notionHighlights" />
                </div>
                <dl className="rd-stats" aria-label={hero.statsLabel}>
                  {hero.stats.map((stat, index) => (
                    <div key={index}>
                      <dt><RichText text={stat.label} /></dt>
                      <dd><RichText text={stat.value} /></dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
          {/* Same story carousel as Aura Logbook; projects-redesign.js reads the hidden slides. The desktop
              modifier gives laptop screenshots a wide frame; phone Shortcuts screens can use the default frame. */}
          <section className="rd-story rd-story--desktop" data-story="" aria-roledescription="carousel" aria-label={hero.story.label}>
            <ul hidden>
              {hero.story.slides.map((slide, index) => (
                <li key={index} data-story-slide="" data-src={slide.image.src} data-alt={slide.image.alt} data-title={slide.title} data-detail={slide.detail} />
              ))}
            </ul>
            <div className="rd-story-bars" data-story-bars="" />
            <figure className="rd-story-frame">
              <img data-story-image="" src={firstSlide.image.src} alt={firstSlide.image.alt} width="1440" height="900" />
            </figure>
            <div className="rd-story-caption">
              <span data-story-caption="" aria-live="off">
                <strong>{firstSlide.title}</strong> · {firstSlide.detail}
              </span>
              <button className="rd-story-toggle" type="button" data-story-toggle="" hidden>Pause</button>
            </div>
          </section>
        </div>
      </section>
      <div className="wrap">
        <CaseStudyArticle sections={notionApiShortcutsContent.sections}>
          <ProjectSequenceNav projects={projects} slug="notion-api-shortcuts" next="auralogbook" />
        </CaseStudyArticle>
      </div>
    </CaseStudyDocument>
  );
}
