/** Builds the worker-safe HTML edition modeled on the repository's warm booklet generator. */
export function buildKnowledgeBooklet(source: string, title: string, _filename: string, tags: string[] = []) {
  const escape = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
  const headings: { id: string; depth: number; text: string }[] = [];
  let headingIndex = 0;
  const inline = (value: string) => escape(value)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/==([^=]+)==/g, "<mark>$1</mark>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
  const body: string[] = [];
  let paragraph: string[] = [];
  let code: string[] | null = null;
  let language = "";
  let hasMermaid = false;
  let table: string[] | null = null;
  const flushParagraph = () => { if (paragraph.length) body.push(`<p>${inline(paragraph.join(" "))}</p>`); paragraph = []; };
  const flushCode = () => {
    if (code === null) return;
    const content = escape(code.join("\n"));
    body.push(language === "mermaid"
      ? `<div class="mermaid" role="img" aria-label="Mermaid diagram">${content}</div>`
      : `<pre><code class="language-${escape(language)}">${content}</code></pre>`);
    if (language === "mermaid") hasMermaid = true;
    code = null;
    language = "";
  };
  const flushTable = () => {
    if (!table || table.length < 2) { table = null; return; }
    const cells = (row: string) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
    const headers = cells(table[0]);
    const rows = table.slice(2).map(cells);
    body.push(`<div class="table-scroll" role="region" aria-label="Scrollable table" tabindex="0"><table><thead><tr>${headers.map((cell) => `<th scope="col">${inline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((_, index) => `<td>${inline(row[index] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    table = null;
  };
  for (const line of source.replace(/\r\n?/g, "\n").split("\n")) {
    const isTableLine = /^\s*\|.*\|\s*$/.test(line);
    if (table !== null && !isTableLine) flushTable();
    if (isTableLine && code === null) { flushParagraph(); table = table ?? []; table.push(line); continue; }
    const fence = line.match(/^\s*```(.*)$/);
    if (fence) { if (code === null) { flushParagraph(); code = []; language = fence[1].trim(); } else flushCode(); continue; }
    if (code !== null) { code.push(line); continue; }
    const heading = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) { flushParagraph(); const depth = heading[1].length; const text = heading[2].replace(/[*_`]/g, "").trim(); const id = `section-${++headingIndex}`; headings.push({ id, depth, text }); body.push(`<h${depth} id="${id}">${inline(text)}</h${depth}>`); }
    else if (/^\s*>/.test(line)) { flushParagraph(); body.push(`<blockquote>${inline(line.replace(/^\s*>\s?/, ""))}</blockquote>`); }
    else if (!line.trim()) flushParagraph();
    else if (/^\s*[-*]\s+/.test(line)) { flushParagraph(); body.push(`<p class="list-item">• ${inline(line.replace(/^\s*[-*]\s+/, ""))}</p>`); }
    else paragraph.push(line.trim());
  }
  flushParagraph(); flushCode(); flushTable();
  const toc = headings.map(({ id, depth, text }) => `<li class="toc-level-${depth}"><a href="#${id}">${inline(text)}</a></li>`).join("");
  const techCards = tags.map((tag) => `<span class="tech-card">${inline(tag)}</span>`).join("");
  const safeTitle = escape(title);
  // Run Mermaid once after the complete document is available so every diagram is rendered.
  const mermaidScript = hasMermaid
    ? `<script type="module">import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";mermaid.initialize({startOnLoad:false,theme:"base"});mermaid.run({querySelector:".mermaid"});</script>`
    : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeTitle}</title><style>:root{--ink:#1e2823;--muted:#4c554f;--green:#355a3a;--pale:#e3f2e3;--line:#b3b3b3;--paper:#f2f3f2;--bg:#f2f2db;--rose:#d49b7e}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:"Avenir Next",Avenir,ui-sans-serif,system-ui,sans-serif;line-height:1.62}.book{max-width:980px;margin:32px auto;background:var(--paper);box-shadow:0 12px 36px #1e282322}.cover,.frontmatter,.content{padding:52px 88px}.cover{min-height:620px;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(145deg,#f2f3f2 0%,#e3f2e3 62%,#d49b7e 100%)}.eyebrow{color:var(--green);font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-size:.78rem}.cover h1{font-size:3.3rem;line-height:1.06;margin:.35rem 0 1rem}.subtitle{font-size:1.28rem;color:var(--muted)}.loop,.tech-strip{display:flex;gap:10px;flex-wrap:wrap;margin:28px 0}.loop span,.tech-card{padding:12px;background:var(--pale);border:1px solid #7db687;font-weight:750}.frontmatter{border-bottom:1px solid var(--line)}h1,h2,h3,h4,h5,h6{line-height:1.2;scroll-margin-top:30px}h1{font-size:2.05rem;border-bottom:2px solid var(--green);padding-bottom:.35rem;margin-top:3rem}h2{font-size:1.35rem;color:var(--green);margin-top:2.15rem}h3{font-size:1.05rem;color:var(--muted);margin-top:1.6rem}.toc{columns:2;column-gap:40px;padding:0;list-style:none}.toc li{break-inside:avoid;margin:.35rem 0}.toc-level-1{font-weight:800}.toc-level-2{padding-left:1rem;font-size:.94rem}a{color:var(--green);text-underline-offset:3px}blockquote{margin:24px 0;padding:12px 18px;border-left:4px solid var(--green);background:#e8ebdf;color:var(--muted)}mark{padding:.08em .2em;background:#f5d98b;color:inherit;border-radius:3px}table{border-collapse:collapse;width:100%}th{background:#dce8d7;font-weight:800;color:var(--ink)}th,td{padding:10px 12px;border:1px solid var(--line);text-align:left;vertical-align:top}pre,.mermaid{margin:24px 0;padding:28px 20px;background:#1e2823;color:#f2f3db;border-left:4px solid var(--rose);overflow:auto;white-space:pre-wrap}.mermaid{display:flex;justify-content:center}.mermaid svg{max-width:100%;height:auto}code{background:var(--pale);padding:.1em .3em;border-radius:3px}.content pre code{background:transparent}.resource-note{padding:16px 18px;background:var(--pale);border:1px solid #7db687}@media(max-width:700px){.book{margin:0;box-shadow:none}.cover,.frontmatter,.content{padding:42px 22px}.cover h1{font-size:2.35rem}.toc{columns:1}}@media print{body{background:#fff}.book{margin:0;box-shadow:none}}</style></head><body><main class="book"><section class="cover"><div class="eyebrow">GemsForge Reference</div><h1>${safeTitle}</h1><p class="subtitle">A practical reference handbook generated from the maintained Markdown source.</p><div class="loop"><span>🧭 Orientation</span><span>🧱 Boundaries</span><span>🧪 Practice</span><span>✅ Evidence</span></div><p class="resource-note">The Markdown source remains authoritative.</p></section><section id="navigator" class="frontmatter"><h1>Navigator</h1><ol class="toc">${toc}</ol>${techCards ? `<h2>Technology referenced in the guide</h2><div class="tech-strip">${techCards}</div>` : ""}</section><article class="content">${body.join("\n")}</article></main>${mermaidScript}</body></html>`;
}
