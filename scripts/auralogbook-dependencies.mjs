// @ts-check

export const DEPENDENCY_LOGO_KIND = Object.freeze({
  FILE: "file",
  SPRITE: "sprite",
  GLYPH: "glyph",
});

/**
 * @typedef {"react"|"typescript"|"dotnet"|"mui"|"redux"|"react_router"|"dapper"|"sqlite"|"swagger"|"csharp"|"notion"|"apple_shortcuts"|"apple_numbers"|"apple_notes"} DependencyId
 * @typedef {"portfolioHighlights"|"workflowTools"} DependencyGroupId
 *
 * @typedef {Object} DependencyLogoFile
 * @property {typeof DEPENDENCY_LOGO_KIND.FILE} kind
 * @property {string} symbolId
 * @property {string} description
 * @property {string} src
 *
 * @typedef {Object} DependencyLogoSprite
 * @property {typeof DEPENDENCY_LOGO_KIND.SPRITE} kind
 * @property {"brand-dotnet"|"brand-mui"} symbolId
 * @property {string} description
 *
 * @typedef {Object} DependencyLogoGlyph
 * @property {typeof DEPENDENCY_LOGO_KIND.GLYPH} kind
 * @property {string} symbolId
 * @property {string} description
 * @property {string} text
 *
 * @typedef {DependencyLogoFile|DependencyLogoSprite|DependencyLogoGlyph} DependencyLogo
 *
 * @typedef {Object} Dependency
 * @property {DependencyId} id
 * @property {string} label
 * @property {DependencyCategory} category
 * @property {DependencyStatus} status
 * @property {DependencyLogo} logo
 * @property {string} sourceUrl Official documentation or project page for this dependency
 *
 * The static page builder is JavaScript, so this JSDoc contract keeps the
 * portfolio-wide source-of-truth catalog typed without a separate TS runtime.
 */

export const DEPENDENCY_CATEGORY = Object.freeze({
  FRONTEND: "frontend",
  BACKEND: "backend",
  LANGUAGE: "language",
  PRODUCTIVITY: "productivity",
});

/** @typedef {typeof DEPENDENCY_CATEGORY[keyof typeof DEPENDENCY_CATEGORY]} DependencyCategory */

export const DEPENDENCY_STATUS = Object.freeze({
  ACTIVE: "active",
  DECLARED_NOT_WIRED: "declared-not-wired",
});

/** @typedef {typeof DEPENDENCY_STATUS[keyof typeof DEPENDENCY_STATUS]} DependencyStatus */

/** @type {Readonly<Record<DependencyId, Dependency>>} */
export const AURALOGBOOK_DEPENDENCIES = Object.freeze({
  react: {
    id: "react",
    label: "React",
    category: DEPENDENCY_CATEGORY.FRONTEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "react", description: "React logo", src: "/assets/auralogbook-stack/react.png" },
    sourceUrl: "https://react.dev/",
  },
  typescript: {
    id: "typescript",
    label: "TypeScript",
    category: DEPENDENCY_CATEGORY.FRONTEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "typescript", description: "TypeScript logo", src: "/assets/auralogbook-stack/typescript.png" },
    sourceUrl: "https://www.typescriptlang.org/",
  },
  dotnet: {
    id: "dotnet",
    label: ".NET 9 API",
    category: DEPENDENCY_CATEGORY.BACKEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.SPRITE, symbolId: "brand-dotnet", description: ".NET logo" },
    sourceUrl: "https://dotnet.microsoft.com/en-us/apps/aspnet",
  },
  mui: {
    id: "mui",
    label: "MUI · Material + Joy",
    category: DEPENDENCY_CATEGORY.FRONTEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.SPRITE, symbolId: "brand-mui", description: "MUI logo" },
    sourceUrl: "https://mui.com/",
  },
  redux: {
    id: "redux",
    label: "Redux Toolkit",
    category: DEPENDENCY_CATEGORY.FRONTEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "redux", description: "Redux Toolkit logo", src: "/assets/auralogbook-stack/redux.png" },
    sourceUrl: "https://redux-toolkit.js.org/",
  },
  react_router: {
    id: "react_router",
    label: "React Router",
    category: DEPENDENCY_CATEGORY.FRONTEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "react-router", description: "React Router logo", src: "/assets/auralogbook-stack/react-router.png" },
    sourceUrl: "https://reactrouter.com/",
  },
  dapper: {
    id: "dapper",
    label: "Dapper · declared, not wired",
    category: DEPENDENCY_CATEGORY.BACKEND,
    status: DEPENDENCY_STATUS.DECLARED_NOT_WIRED,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "dapper", description: "Dapper logo", src: "/assets/auralogbook-stack/dapper.png" },
    sourceUrl: "https://github.com/DapperLib/Dapper",
  },
  sqlite: {
    id: "sqlite",
    label: "SQLite · declared, not wired",
    category: DEPENDENCY_CATEGORY.BACKEND,
    status: DEPENDENCY_STATUS.DECLARED_NOT_WIRED,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "sqlite", description: "SQLite logo", src: "/assets/auralogbook-stack/sqlite.png" },
    sourceUrl: "https://sqlite.org/",
  },
  swagger: {
    id: "swagger",
    label: "Swashbuckle · Swagger",
    category: DEPENDENCY_CATEGORY.BACKEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "swagger", description: "Swagger logo", src: "/assets/auralogbook-stack/swagger.png" },
    sourceUrl: "https://github.com/domaindrivendev/Swashbuckle.AspNetCore",
  },
  csharp: {
    id: "csharp",
    label: "C#",
    category: DEPENDENCY_CATEGORY.LANGUAGE,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "csharp", description: "C# logo", src: "/assets/auralogbook-stack/csharp.png" },
    sourceUrl: "https://learn.microsoft.com/dotnet/csharp/",
  },
  notion: {
    id: "notion",
    label: "Notion",
    category: DEPENDENCY_CATEGORY.PRODUCTIVITY,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "notion", description: "Notion logo", src: "/assets/auralogbook-stack/notion.png" },
    sourceUrl: "https://www.notion.so/",
  },
  apple_shortcuts: {
    id: "apple_shortcuts",
    label: "Apple Shortcuts",
    category: DEPENDENCY_CATEGORY.PRODUCTIVITY,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.GLYPH, symbolId: "apple-shortcuts-glyph", text: "⌘", description: "Generic Apple glyph; Shortcuts app icon not yet added" },
    sourceUrl: "https://support.apple.com/guide/shortcuts/welcome/ios",
  },
  apple_numbers: {
    id: "apple_numbers",
    label: "Apple Numbers",
    category: DEPENDENCY_CATEGORY.PRODUCTIVITY,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "apple-numbers", description: "Apple Numbers logo", src: "/assets/auralogbook-stack/apple-numbers.png" },
    sourceUrl: "https://www.apple.com/numbers/",
  },
  apple_notes: {
    id: "apple_notes",
    label: "Apple Notes",
    category: DEPENDENCY_CATEGORY.PRODUCTIVITY,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "apple-notes", description: "Apple Notes logo", src: "/assets/auralogbook-stack/apple-notes.png" },
    sourceUrl: "https://www.apple.com/notes/",
  },
});

/** @type {Readonly<Record<DependencyGroupId, { label: string, ids: DependencyId[] }>>} */
export const AURALOGBOOK_DEPENDENCY_GROUPS = Object.freeze({
  portfolioHighlights: {
    label: "AuraLogbook technology highlights",
    ids: ["react", "typescript", "csharp", "dotnet", "mui", "redux", "react_router", "dapper", "sqlite", "swagger"],
  },
  workflowTools: {
    label: "Workflow and Apple productivity tools",
    ids: ["notion", "apple_shortcuts", "apple_numbers", "apple_notes"],
  },
});

/** @param {string} value */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

/** @param {DependencyLogo} logo */
function renderLogo(logo) {
  if (logo.kind === DEPENDENCY_LOGO_KIND.FILE) {
    return `<img class="dependency-chip-logo" src="${escapeHtml(logo.src)}" alt="" title="${escapeHtml(logo.description)}" data-logo-symbol="${escapeHtml(logo.symbolId)}" aria-hidden="true" loading="lazy" decoding="async">`;
  }

  if (logo.kind === DEPENDENCY_LOGO_KIND.SPRITE) {
    return `<svg class="dependency-chip-logo" viewBox="0 0 24 24" title="${escapeHtml(logo.description)}" data-logo-symbol="${escapeHtml(logo.symbolId)}" aria-hidden="true" focusable="false"><use href="/assets/aura-logbook-architecture.svg#${escapeHtml(logo.symbolId)}"></use></svg>`;
  }

  return `<span class="dependency-chip-logo dependency-chip-glyph" title="${escapeHtml(logo.description)}" data-logo-symbol="${escapeHtml(logo.symbolId)}" aria-hidden="true">${escapeHtml(logo.text)}</span>`;
}

/** @param {DependencyGroupId} groupId */
export function renderDependencyGroup(groupId) {
  const group = AURALOGBOOK_DEPENDENCY_GROUPS[groupId];
  if (!group) throw new Error(`Unknown AuraLogbook dependency group: ${groupId}`);

  const items = group.ids.map((dependencyId) => {
    const dependency = AURALOGBOOK_DEPENDENCIES[dependencyId];
    if (!dependency) throw new Error(`Unknown AuraLogbook dependency: ${dependencyId}`);
    return `<li class="dependency-chip" data-dependency="${escapeHtml(dependency.id)}" data-category="${dependency.category}" data-status="${dependency.status}">${renderLogo(dependency.logo)}<span class="dependency-chip-label">${escapeHtml(dependency.label)}</span></li>`;
  }).join("");

  return `<ul class="dependency-chip-list" aria-label="${escapeHtml(group.label)}">${items}</ul>`;
}
