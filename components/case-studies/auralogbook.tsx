import { auralogbookContent as content } from "../../content/case-studies/auralogbook.ts";
import { CaseStudyArticle, FactList, RichText } from "./content-blocks.tsx";
import { CaseStudyDocument, ProjectSequenceNav, type CaseStudyProps } from "./case-study-shell.tsx";

/**
 * Layout for the Aura Logbook case study. Unlike the other case studies it keeps
 * the #131 dark story hero, a recruiter snapshot, and a shared screen dialog, and
 * loads their scripts and styles. All text comes from
 * content/case-studies/auralogbook.ts; name, pre-title, and lead come from the catalog.
 */
export function AuralogbookCaseStudy({ project, projects }: CaseStudyProps) {
  const { hero, story, snapshot, imageDialog } = content;
  const [firstSlide] = story.slides;
  // auralogbook-image-dialog.js finds the dialog's title, help, and preview by these ids.
  const dialogTitleId = `${imageDialog.id}-title`;
  const dialogHelpId = `${imageDialog.id}-help`;
  return (
    <CaseStudyDocument
      project={project}
      description={content.description}
      // The query string busts caches for the recruiter-first case study styles.
      siteStylesheet="/assets/site.css?v=auralogbook-recruiter-case-20261112"
      stylesheets={["/assets/auralogbook-image-dialog.css", "/assets/redesign.css"]}
      scripts={["/assets/projects-redesign.js", "/assets/auralogbook-image-dialog.js"]}
      bodyClassName="rd"
    >
      {/* #131 redesign: dark story hero leads with real phone screens, then the recruiter snapshot and detail. */}
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
                <div className="facts">
                  <div data-dependency-group="portfolioHighlights" />
                </div>
                <div className="actions case-project-actions">
                  <a className="button" href={hero.sourceLink.href}><RichText text={hero.sourceLink.text} /></a>{" "}
                  <a className="button secondary" href={hero.screensLink.href}><RichText text={hero.screensLink.text} /></a>
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
          {/* Story-style screen carousel; projects-redesign.js reads the hidden slides and adds progress bars and autoplay with a pause control. */}
          <section className="rd-story" data-story="" aria-roledescription="carousel" aria-label={story.label}>
            <ul hidden>
              {story.slides.map((slide, index) => (
                <li key={index} data-story-slide="" data-src={slide.image.src} data-alt={slide.image.alt} data-title={slide.title} data-detail={slide.detail} />
              ))}
            </ul>
            <div className="rd-story-bars" data-story-bars="" />
            <figure className="rd-story-frame">
              <img data-story-image="" src={firstSlide.image.src} alt={firstSlide.image.alt} width="332" height="720" />
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
      <div className="wrap rd-case-body">
        {/* Recruiter scan order: role, stack, system boundaries, then detailed evidence. */}
        <section className="project-snapshot" aria-labelledby="project-snapshot-heading">
          <div>
            <h2 id="project-snapshot-heading">{snapshot.title}</h2>
            <FactList facts={snapshot.facts} className="project-snapshot-facts" />
          </div>
          <p className="project-status">
            <strong><RichText text={snapshot.status.label} /></strong>
            <span><RichText text={snapshot.status.value} /></span>
          </p>
        </section>
        <CaseStudyArticle
          sections={content.sections}
          afterSection={{
            // One dialog serves every screen; auralogbook-image-dialog.js fills it from the clicked trigger.
            [imageDialog.afterSection]: (
              <dialog id={imageDialog.id} className="aura-image-dialog" aria-labelledby={dialogTitleId} aria-describedby={dialogHelpId}>
                <div className="aura-image-dialog-bar">
                  <span id={dialogTitleId}>{imageDialog.defaultTitle}</span>{" "}
                  <button className="aura-image-dialog-close" type="button" data-aura-image-close="">
                    Close <kbd>Esc</kbd>
                  </button>
                </div>
                <p className="aura-image-dialog-help" id={dialogHelpId}>{imageDialog.help}</p>
                <div className="aura-image-dialog-viewport" tabIndex={0} aria-label={imageDialog.viewportLabel}>
                  <img id={`${imageDialog.id}-preview`} alt="" width="1600" height="1100" />
                </div>
              </dialog>
            ),
          }}
        >
          <ProjectSequenceNav projects={projects} slug="auralogbook" next="apple-ecosystem" />
        </CaseStudyArticle>
      </div>
    </CaseStudyDocument>
  );
}
