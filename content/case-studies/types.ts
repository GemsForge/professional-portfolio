/**
 * Content shapes for the portfolio case study pages (#136).
 *
 * Every word a visitor reads on a case study lives in a `content/case-studies/<slug>.ts`
 * file typed with these interfaces; `components/case-studies/` only decides layout.
 * Project name, pre-title, description, and banner image stay in
 * `scripts/project-catalog.mts` because project cards share them.
 *
 * This module is type-only so the build-time renderer can import it anywhere.
 */

/**
 * Inline text with a small Markdown subset, rendered without raw HTML:
 * `**bold**`, `*emphasis*`, `` `code` ``, `[label](url)`, and
 * `[label](url new-tab)` for links that open in a new tab.
 * Escape a literal `*`, `` ` ``, `[`, `]`, or `\` with a backslash.
 * An unclosed marker fails the build.
 */
export type Inline = string;

/** An image with the attributes the case studies use. */
export interface ImageContent {
  src: string;
  /** Empty string marks a decorative image. */
  alt: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
}

/** A term and its description, rendered as a `<dt>`/`<dd>` pair. */
export interface Fact {
  term: Inline;
  detail: Inline;
}

/** A card or step with a short heading and one paragraph. */
export interface TitledText {
  title: Inline;
  text: Inline;
}

export type Block =
  /** A plain string is a paragraph; use the object form to add a class. */
  | Inline
  | { type: "paragraph"; text: Inline; className?: string }
  | { type: "heading"; level: 3 | 4; text: Inline }
  | { type: "list"; items: Inline[]; ordered?: boolean; className?: string }
  /**
   * A responsibility table. `label` makes the scroll wrapper a focusable,
   * named region; the first cell of each row is its row header.
   */
  | { type: "table"; label?: string; caption?: Inline; columns: Inline[]; rows: Inline[][] }
  /**
   * Preformatted code; whitespace is kept exactly. It renders as a focusable,
   * named region so keyboard users can scroll it; `label` defaults to "Code example".
   */
  | { type: "code"; code: string; label?: string }
  /** A callout box; `aside` renders it as complementary content. */
  | { type: "note"; blocks: Block[]; aside?: boolean; className?: string }
  | { type: "figure"; image: ImageContent; caption: Inline }
  | { type: "button"; text: Inline; href: string }
  | { type: "details"; summary: Inline; blocks: Block[] }
  /** Cards rendered as `<article>` elements inside a wrapper with `className`. */
  | { type: "cards"; className: string; items: TitledText[] }
  /** Ordered steps, each with a heading and a paragraph. */
  | { type: "steps"; className: string; items: TitledText[] }
  /** Screens that open in the page's image dialog (see `imageDialog`). */
  | { type: "screen-gallery"; dialogId: string; items: ScreenContent[] }
  /** Record cards with an optional relationship arrow between them. */
  | { type: "schema-map"; label: string; items: (SchemaCard | SchemaRelationship)[] };

/** One screen in a `screen-gallery`. */
export interface ScreenContent {
  /** Title shown in the image dialog. */
  title: string;
  image: ImageContent;
  /** Alt text for the enlarged image in the dialog. */
  enlargedAlt: string;
  /** Accessible name of the button that opens the dialog. */
  openLabel: string;
  /** Visible caption under the screen. */
  caption: Inline;
}

export interface SchemaCard {
  kind: "card";
  /** Modifier class, e.g. `schema-user`. */
  className: string;
  kicker: Inline;
  title: Inline;
  facts: Fact[];
  /** Optional closing paragraph inside the card. */
  note?: Inline;
}

export interface SchemaRelationship {
  kind: "relationship";
  label: string;
  from: string;
  to: string;
}

/** Architecture diagram with a zoom dialog, enhanced by `/assets/architecture-diagram.js`. */
export interface ArchitectureContent {
  /** Optional visible heading and introduction above the diagram. */
  title?: Inline;
  intro?: Inline;
  /** Accessible name of the section when it has no visible heading. */
  ariaLabel: string;
  dialogId: string;
  image: ImageContent;
  /** Accessible name of the zoom button and of the image itself. */
  openLabel: string;
  imageLabel: string;
  /** Screen-reader-only list of the technologies the diagram shows. */
  techList?: string[];
  caption: Inline;
  dialogLabel: string;
  dialogTitle: string;
  /** Hint read on the zoom area inside the dialog. */
  zoomHint: string;
  enlargedImage: ImageContent;
}

interface SectionBase {
  /** Anchor id; also the target of the "On this page" link. */
  id: string;
  /** Label in the "On this page" navigation; omit to leave the section out. */
  nav?: string;
}

export interface StandardSection extends SectionBase {
  kind?: "standard";
  title: Inline;
  /** Gives the heading an id and labels the section with it. */
  headingId?: string;
  className?: string;
  ariaLabel?: string;
  blocks: Block[];
}

export interface ArchitectureSection extends SectionBase {
  kind: "architecture";
  architecture: ArchitectureContent;
}

export type Section = StandardSection | ArchitectureSection;

/** Everything a standard case study page says, in reading order. */
export interface CaseStudyContent {
  /** Search and social preview description. */
  description: string;
  sections: Section[];
}

/** One phone screen in the Aura Logbook story carousel. */
export interface StorySlide {
  image: ImageContent;
  title: string;
  detail: string;
}

/** Aura Logbook adds a story hero, a snapshot, and an image dialog to the standard page. */
export interface AuralogbookContent extends CaseStudyContent {
  hero: {
    brandIcon: ImageContent;
    sourceLink: { text: Inline; href: string };
    screensLink: { text: Inline; href: string };
    statsLabel: string;
    stats: { label: Inline; value: Inline }[];
  };
  story: {
    label: string;
    /** At least one slide; the first is shown before the carousel script runs. */
    slides: [StorySlide, ...StorySlide[]];
  };
  snapshot: {
    title: string;
    facts: Fact[];
    status: { label: Inline; value: Inline };
  };
  imageDialog: {
    id: string;
    /** Rendered after this section, inside the article. */
    afterSection: string;
    defaultTitle: string;
    help: string;
    viewportLabel: string;
  };
}
