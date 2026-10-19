/**
 * Typed source of truth for the Aura Logbook dependency badges.
 *
 * The plain Node page-preparation script imports this module directly using
 * Node's built-in TypeScript type stripping; keep this file free of JSX and
 * runtime-only TypeScript features.
 */
export const DEPENDENCY_LOGO_KIND = Object.freeze({
  FILE: "file",
  SPRITE: "sprite",
  GLYPH: "glyph",
});

export type DependencyId =
  | "react" | "typescript" | "vite" | "dotnet" | "mui" | "redux"
  | "react_router" | "axios" | "react_hook_form" | "yup" | "dayjs"
  | "dapper" | "sqlite" | "swagger" | "csharp" | "bcrypt" | "jwt_bearer"
  | "notion" | "apple_shortcuts" | "apple_numbers" | "apple_notes"
  | "apple_freeform" | "apple_reminders" | "apple_calendar" | "apple_siri"
  | "apple_icloud";
export type DependencyGroupId = "portfolioHighlights" | "workflowTools" | "disciplineHighlights";
export type DependencyCategory = "frontend" | "backend" | "language" | "productivity";
export type DependencyStatus = "active" | "declared-not-wired";

export interface DependencyLogoFile {
  kind: typeof DEPENDENCY_LOGO_KIND.FILE;
  symbolId: string;
  description: string;
  src: string;
}
export interface DependencyLogoSprite {
  kind: typeof DEPENDENCY_LOGO_KIND.SPRITE;
  symbolId: "brand-dotnet" | "brand-mui" | "brand-apple" | "brand-vite";
  description: string;
}
export interface DependencyLogoGlyph {
  kind: typeof DEPENDENCY_LOGO_KIND.GLYPH;
  symbolId: string;
  description: string;
  text: string;
}
export type DependencyLogo = DependencyLogoFile | DependencyLogoSprite | DependencyLogoGlyph;
export interface Dependency {
  id: DependencyId;
  label: string;
  category: DependencyCategory;
  status: DependencyStatus;
  logo: DependencyLogo;
  sourceUrl: string;
}
export interface DependencyGroup {
  label: string;
  ids: DependencyId[];
}

export const DEPENDENCY_CATEGORY = Object.freeze({
  FRONTEND: "frontend",
  BACKEND: "backend",
  LANGUAGE: "language",
  PRODUCTIVITY: "productivity",
});


export const DEPENDENCY_STATUS = Object.freeze({
  ACTIVE: "active",
  DECLARED_NOT_WIRED: "declared-not-wired",
});


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
  vite: {
    id: "vite",
    label: "Vite",
    category: DEPENDENCY_CATEGORY.FRONTEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.SPRITE, symbolId: "brand-vite", description: "Vite logo" },
    sourceUrl: "https://vite.dev/",
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
  axios: {
    id: "axios",
    label: "Axios",
    category: DEPENDENCY_CATEGORY.FRONTEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "axios", description: "Axios logo", src: "/assets/auralogbook-stack/axios.png" },
    sourceUrl: "https://axios-http.com/",
  },
  react_hook_form: {
    id: "react_hook_form",
    label: "React Hook Form",
    category: DEPENDENCY_CATEGORY.FRONTEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "form-validation", description: "Generic form-validation mark; not an official React Hook Form logo", src: "/assets/auralogbook-stack/form-validation.png" },
    sourceUrl: "https://react-hook-form.com/",
  },
  yup: {
    id: "yup",
    label: "Yup",
    category: DEPENDENCY_CATEGORY.FRONTEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "form-validation", description: "Generic form-validation mark; not an official Yup logo", src: "/assets/auralogbook-stack/form-validation.png" },
    sourceUrl: "https://github.com/jquense/yup",
  },
  dayjs: {
    id: "dayjs",
    label: "Day.js",
    category: DEPENDENCY_CATEGORY.FRONTEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "dayjs", description: "Day.js logo", src: "/assets/auralogbook-stack/dayjs.png" },
    sourceUrl: "https://day.js.org/",
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
  bcrypt: {
    id: "bcrypt",
    label: "BCrypt.Net-Next",
    category: DEPENDENCY_CATEGORY.BACKEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "bcrypt", description: "BCrypt.Net-Next logo", src: "/assets/auralogbook-stack/bcrypt.png" },
    sourceUrl: "https://github.com/BcryptNet/bcrypt.net",
  },
  jwt_bearer: {
    id: "jwt_bearer",
    label: "JWT Bearer",
    category: DEPENDENCY_CATEGORY.BACKEND,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.FILE, symbolId: "jwt-bearer", description: "JWT Bearer logo", src: "/assets/auralogbook-stack/jwt-bearer.png" },
    sourceUrl: "https://learn.microsoft.com/aspnet/core/security/authentication/configure-jwt-bearer-authentication",
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
    logo: { kind: DEPENDENCY_LOGO_KIND.SPRITE, symbolId: "brand-apple", description: "Apple brand logo" },
    sourceUrl: "https://developer.apple.com/",
  },
  apple_numbers: {
    id: "apple_numbers",
    label: "Apple Numbers",
    category: DEPENDENCY_CATEGORY.PRODUCTIVITY,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.SPRITE, symbolId: "brand-apple", description: "Apple brand logo" },
    sourceUrl: "https://developer.apple.com/",
  },
  apple_notes: {
    id: "apple_notes",
    label: "Apple Notes",
    category: DEPENDENCY_CATEGORY.PRODUCTIVITY,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.SPRITE, symbolId: "brand-apple", description: "Apple brand logo" },
    sourceUrl: "https://developer.apple.com/",
  },
  apple_freeform: {
    id: "apple_freeform",
    label: "Apple Freeform",
    category: DEPENDENCY_CATEGORY.PRODUCTIVITY,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.SPRITE, symbolId: "brand-apple", description: "Apple brand logo" },
    sourceUrl: "https://developer.apple.com/",
  },
  apple_reminders: {
    id: "apple_reminders",
    label: "Apple Reminders",
    category: DEPENDENCY_CATEGORY.PRODUCTIVITY,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.SPRITE, symbolId: "brand-apple", description: "Apple brand logo" },
    sourceUrl: "https://developer.apple.com/",
  },
  apple_calendar: {
    id: "apple_calendar",
    label: "Apple Calendar",
    category: DEPENDENCY_CATEGORY.PRODUCTIVITY,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.SPRITE, symbolId: "brand-apple", description: "Apple brand logo" },
    sourceUrl: "https://developer.apple.com/",
  },
  apple_siri: {
    id: "apple_siri",
    label: "Siri",
    category: DEPENDENCY_CATEGORY.PRODUCTIVITY,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.SPRITE, symbolId: "brand-apple", description: "Apple brand logo" },
    sourceUrl: "https://developer.apple.com/",
  },
  apple_icloud: {
    id: "apple_icloud",
    label: "iCloud",
    category: DEPENDENCY_CATEGORY.PRODUCTIVITY,
    status: DEPENDENCY_STATUS.ACTIVE,
    logo: { kind: DEPENDENCY_LOGO_KIND.SPRITE, symbolId: "brand-apple", description: "Apple brand logo" },
    sourceUrl: "https://developer.apple.com/",
  },
}) satisfies Readonly<Record<DependencyId, Dependency>>;

export const AURALOGBOOK_DEPENDENCY_GROUPS = Object.freeze({
  portfolioHighlights: {
    label: "AuraLogbook technology highlights",
    ids: ["react", "typescript", "vite", "csharp", "dotnet", "mui", "redux", "react_router", "axios", "react_hook_form", "yup", "dayjs", "bcrypt", "jwt_bearer", "dapper", "sqlite", "swagger"],
  },
  workflowTools: {
    label: "Workflow and Apple productivity tools",
    ids: ["notion", "apple_shortcuts", "apple_numbers", "apple_notes", "apple_freeform", "apple_reminders", "apple_calendar", "apple_siri", "apple_icloud"],
  },
  disciplineHighlights: {
    label: "75 Days of Discipline technology highlights",
    ids: ["notion", "apple_shortcuts"],
  },
}) satisfies Readonly<Record<DependencyGroupId, DependencyGroup>>;

function escapeHtml(value: string) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function renderLogo(logo: DependencyLogo) {
  if (logo.kind === DEPENDENCY_LOGO_KIND.FILE) {
    return `<img class="dependency-chip-logo" src="${escapeHtml(logo.src)}" alt="" title="${escapeHtml(logo.description)}" data-logo-symbol="${escapeHtml(logo.symbolId)}" aria-hidden="true" loading="lazy" decoding="async">`;
  }

  if (logo.kind === DEPENDENCY_LOGO_KIND.SPRITE) {
    return `<svg class="dependency-chip-logo" viewBox="0 0 24 24" title="${escapeHtml(logo.description)}" data-logo-symbol="${escapeHtml(logo.symbolId)}" aria-hidden="true" focusable="false"><use href="/assets/aura-logbook-architecture.svg#${escapeHtml(logo.symbolId)}"></use></svg>`;
  }

  return `<span class="dependency-chip-logo dependency-chip-glyph" title="${escapeHtml(logo.description)}" data-logo-symbol="${escapeHtml(logo.symbolId)}" aria-hidden="true">${escapeHtml(logo.text)}</span>`;
}

export function renderDependencyGroup(groupId: DependencyGroupId) {
  const group = AURALOGBOOK_DEPENDENCY_GROUPS[groupId];
  if (!group) throw new Error(`Unknown AuraLogbook dependency group: ${groupId}`);

  const items = group.ids.map((dependencyId: DependencyId) => {
    const dependency = AURALOGBOOK_DEPENDENCIES[dependencyId];
    if (!dependency) throw new Error(`Unknown AuraLogbook dependency: ${dependencyId}`);
    return `<li><a class="dependency-chip" data-dependency="${escapeHtml(dependency.id)}" data-category="${dependency.category}" data-status="${dependency.status}" href="${escapeHtml(dependency.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(dependency.label)} source in a new tab">${renderLogo(dependency.logo)}<span class="dependency-chip-label">${escapeHtml(dependency.label)}</span></a></li>`;
  }).join("");

  return `<ul class="dependency-chip-list" aria-label="${escapeHtml(group.label)}">${items}</ul>`;
}
