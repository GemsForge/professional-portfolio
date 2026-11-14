import { Fragment, type ReactNode } from "react";
import type { ArchitectureContent, Block, Fact, ImageContent, Inline, Section } from "../../content/case-studies/types.ts";
import { parseInline, type InlineNode } from "./inline-markup.ts";

/**
 * Renders case study content (#136). These components own every element,
 * class name, and accessibility attribute; content files supply only words,
 * image references, and structure. Interactive behavior is added in the
 * browser by the scripts the page loads (architecture-diagram.js,
 * auralogbook-image-dialog.js), so the markup hooks here must stay stable.
 */

function renderNodes(nodes: InlineNode[]): ReactNode[] {
  return nodes.map((node, index) => {
    if (typeof node === "string") return node;
    if (node.kind === "code") return <code key={index}>{node.text}</code>;
    if (node.kind !== "link") {
      const Tag = node.kind;
      return <Tag key={index}>{renderNodes(node.children)}</Tag>;
    }
    return node.newTab ? (
      <a key={index} href={node.href} target="_blank" rel="noopener">{renderNodes(node.children)}</a>
    ) : (
      <a key={index} href={node.href}>{renderNodes(node.children)}</a>
    );
  });
}

/** Renders one inline content string (bold, emphasis, code, links) as React elements. */
export function RichText({ text }: { text: Inline }) {
  return <>{renderNodes(parseInline(text))}</>;
}

/** Renders an image with only the attributes the content provides. */
export function ContentImage({ image }: { image: ImageContent }) {
  return <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading={image.loading} />;
}

/** Renders facts as a `<dl>`; shared by schema cards and the Aura snapshot. */
export function FactList({ facts, className }: { facts: Fact[]; className?: string }) {
  return (
    <dl className={className}>
      {facts.map((fact, index) => (
        <div key={index}>
          <dt><RichText text={fact.term} /></dt>
          <dd><RichText text={fact.detail} /></dd>
        </div>
      ))}
    </dl>
  );
}

/** Renders one content block. */
export function ContentBlock({ block }: { block: Block }): ReactNode {
  if (typeof block === "string") return <p><RichText text={block} /></p>;
  switch (block.type) {
    case "paragraph":
      return <p className={block.className}><RichText text={block.text} /></p>;
    case "heading":
      return block.level === 3 ? <h3><RichText text={block.text} /></h3> : <h4><RichText text={block.text} /></h4>;
    case "list": {
      const items = block.items.map((item, index) => <li key={index}><RichText text={item} /></li>);
      return block.ordered ? <ol className={block.className}>{items}</ol> : <ul className={block.className}>{items}</ul>;
    }
    case "table": {
      // A labelled wrapper becomes a keyboard-focusable, named region so wide tables can scroll.
      const region = block.label ? { role: "region", tabIndex: 0, "aria-label": block.label } : {};
      return (
        <div className="table-scroll" {...region}>
          <table className="toolmap">
            {block.caption ? <caption><RichText text={block.caption} /></caption> : null}
            <thead>
              <tr>{block.columns.map((column, index) => <th key={index} scope="col"><RichText text={column} /></th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map(([header, ...cells], rowIndex) => (
                <tr key={rowIndex}>
                  <th scope="row"><RichText text={header} /></th>
                  {cells.map((cell, index) => <td key={index}><RichText text={cell} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "code":
      // Code scrolls sideways on phones; a named, focusable region lets keyboard users scroll it (WCAG 2.1.1).
      return (
        <pre className="code" role="region" tabIndex={0} aria-label={block.label ?? "Code example"}>
          <code>{block.code}</code>
        </pre>
      );
    case "note": {
      const children = <ContentBlocks blocks={block.blocks} />;
      const className = block.className ?? "note";
      return block.aside ? <aside className={className}>{children}</aside> : <div className={className}>{children}</div>;
    }
    case "figure":
      return (
        <figure className="case-figure">
          <ContentImage image={block.image} />
          <figcaption><RichText text={block.caption} /></figcaption>
        </figure>
      );
    case "button":
      return <a className="button secondary" href={block.href}><RichText text={block.text} /></a>;
    case "details":
      return (
        <details>
          <summary><RichText text={block.summary} /></summary>
          <ContentBlocks blocks={block.blocks} />
        </details>
      );
    case "cards":
      return (
        <div className={block.className}>
          {block.items.map((item, index) => (
            <article key={index}>
              <h3><RichText text={item.title} /></h3>
              <p><RichText text={item.text} /></p>
            </article>
          ))}
        </div>
      );
    case "steps":
      return (
        <ol className={block.className}>
          {block.items.map((item, index) => (
            <li key={index}>
              <h3><RichText text={item.title} /></h3>
              <p><RichText text={item.text} /></p>
            </li>
          ))}
        </ol>
      );
    case "screen-gallery":
      // auralogbook-image-dialog.js reads the data-image-* attributes to fill the shared dialog.
      return (
        <>
          {block.items.map((screen, index) => (
            <figure key={index}>
              <button
                className="aura-image-trigger"
                type="button"
                data-aura-image-trigger=""
                data-image-title={screen.title}
                data-image-src={screen.image.src}
                data-image-alt={screen.enlargedAlt}
                aria-haspopup="dialog"
                aria-controls={block.dialogId}
                aria-label={screen.openLabel}
              >
                <ContentImage image={screen.image} />
              </button>
              <figcaption><RichText text={screen.caption} /></figcaption>
            </figure>
          ))}
        </>
      );
    case "schema-map":
      return (
        <div className="schema-map" aria-label={block.label}>
          {block.items.map((item, index) =>
            item.kind === "card" ? (
              <article key={index} className={`schema-card ${item.className}`}>
                <p className="schema-kicker"><RichText text={item.kicker} /></p>
                <h3><RichText text={item.title} /></h3>
                <FactList facts={item.facts} />
                {item.note ? <p><RichText text={item.note} /></p> : null}
              </article>
            ) : (
              <p key={index} className="schema-relationship" aria-label={item.label}>
                <span>{item.from}</span>
                <span aria-hidden="true">→</span>
                <span>{item.to}</span>
              </p>
            ),
          )}
        </div>
      );
    default: {
      // Type checking rejects unknown block types; this guards content that slips past it.
      const unknown: never = block;
      throw new Error(`Unknown case study content block: ${JSON.stringify(unknown)}`);
    }
  }
}

/** Renders a sequence of content blocks. */
export function ContentBlocks({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map((block, index) => <ContentBlock key={index} block={block} />)}</>;
}

/**
 * Architecture diagram with an enlarge dialog. `/assets/architecture-diagram.js`
 * wires the zoom buttons, the clickable image, and the dialog by these classes.
 */
export function ArchitectureFigure({ id, content }: { id: string; content: ArchitectureContent }) {
  const techListId = content.techList ? `${id}-tech-list` : undefined;
  // The image's accessible name is the zoom action, which would hide its alt text from
  // screen readers, so the diagram description is also exposed as an accessible description (WCAG 1.1.1).
  const descriptionId = `${id}-description`;
  return (
    <section id={id} className="architecture architecture-component" aria-label={content.ariaLabel}>
      {content.title ? <h2><RichText text={content.title} /></h2> : null}
      {content.intro ? <p><RichText text={content.intro} /></p> : null}
      <figure className="architecture-figure">
        <button className="architecture-open" type="button" aria-haspopup="dialog" aria-controls={content.dialogId} aria-label={content.openLabel}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.5" />
            <path d="m16 16 5 5M10.8 7.5v6.6M7.5 10.8h6.6" />
          </svg>
          <span>Zoom</span>
        </button>
        <img
          className="architecture-image"
          src={content.image.src}
          alt={content.image.alt}
          aria-describedby={[descriptionId, techListId].filter(Boolean).join(" ")}
          width={content.image.width}
          height={content.image.height}
          loading="lazy"
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-label={content.imageLabel}
        />
        <p className="sr-only" id={descriptionId}>{content.image.alt}</p>
        {content.techList ? (
          <ul className="sr-only" id={techListId} aria-label="Technology dependency labels">
            {content.techList.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        ) : null}
        <figcaption>
          <button className="architecture-text-open" type="button" aria-haspopup="dialog" aria-controls={content.dialogId}>Click to zoom</button>
          <span> · <RichText text={content.caption} /></span>
        </figcaption>
      </figure>
      <dialog className="architecture-dialog" id={content.dialogId} aria-label={content.dialogLabel}>
        <div className="architecture-dialog-bar">
          <span>{content.dialogTitle}</span>
          <button className="architecture-close" type="button" aria-label="Close enlarged diagram">
            Close <kbd>Esc</kbd>
          </button>
        </div>
        <div className="architecture-zoom-area" tabIndex={0} aria-label={content.zoomHint}>
          <ContentImage image={content.enlargedImage} />
        </div>
      </dialog>
      <script src="/assets/architecture-diagram.js" defer />
    </section>
  );
}

/** Renders one section: a standard heading plus blocks, or an architecture diagram. */
export function CaseStudySection({ section }: { section: Section }) {
  if (section.kind === "architecture") return <ArchitectureFigure id={section.id} content={section.architecture} />;
  return (
    <section
      id={section.id}
      className={section.className}
      aria-label={section.ariaLabel}
      aria-labelledby={section.headingId}
    >
      <h2 id={section.headingId}><RichText text={section.title} /></h2>
      <ContentBlocks blocks={section.blocks} />
    </section>
  );
}

interface CaseStudyArticleProps {
  sections: Section[];
  /** Extra content rendered right after the section with the given id; an unknown id fails the build. */
  afterSection?: Record<string, ReactNode>;
  /** Closing content inside the article, typically ProjectSequenceNav. */
  children?: ReactNode;
}

/**
 * The two-column case study body: an "On this page" navigation built from
 * each section's `nav` label, and the article with every section in order.
 */
export function CaseStudyArticle({ sections, afterSection = {}, children }: CaseStudyArticleProps) {
  // A misspelled id would otherwise drop the extra content (e.g. the Aura image dialog) without an error.
  const unknownIds = Object.keys(afterSection).filter((id) => !sections.some((section) => section.id === id));
  if (unknownIds.length) throw new Error(`afterSection names unknown section id(s): ${unknownIds.join(", ")}`);
  return (
    <div className="case-layout">
      <aside className="case-nav">
        <nav aria-label="On this project page">
          <p>On this page</p>
          {sections.filter((section) => section.nav).map((section) => (
            <a key={section.id} href={`#${section.id}`}>{section.nav}</a>
          ))}
        </nav>
      </aside>
      <article className="case-content">
        {sections.map((section) => (
          <Fragment key={section.id}>
            <CaseStudySection section={section} />
            {afterSection[section.id]}
          </Fragment>
        ))}
        {children}
      </article>
    </div>
  );
}
