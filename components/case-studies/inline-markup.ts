/**
 * Parser for the inline Markdown subset used by case study content
 * (see `Inline` in content/case-studies/types.ts). It produces a small tree that
 * `RichText` renders as React elements, so content never becomes raw HTML.
 */

export type InlineNode =
  | string
  | { kind: "strong" | "em"; children: InlineNode[] }
  | { kind: "code"; text: string }
  | { kind: "link"; href: string; newTab: boolean; children: InlineNode[] };

/**
 * Option word after a link URL that opens it in a new tab: `[label](url new-tab)`.
 * It needs no quotes, so it can be typed inside a double-quoted content string.
 */
const NEW_TAB = "new-tab";

/**
 * Parses inline content.
 *
 * @param source Content string, e.g. `See **the** [docs](https://example.com new-tab).`
 * @returns Text and formatting nodes in reading order.
 * @throws When a marker is left open or a link is malformed, so bad content fails the build.
 */
export function parseInline(source: string): InlineNode[] {
  const [nodes, end] = parseUntil(source, 0, null);
  if (end !== source.length) throw new Error(`Unexpected "${source[end]}" at ${end} in: ${source}`);
  return nodes;
}

function parseUntil(source: string, start: number, stop: "**" | "*" | "]" | null): [InlineNode[], number] {
  const nodes: InlineNode[] = [];
  let text = "";
  const flush = () => {
    if (text) nodes.push(text);
    text = "";
  };
  let i = start;
  while (i < source.length) {
    // `**` closes strong; a lone `*` closes emphasis but `**` inside emphasis opens strong.
    if (stop && source.startsWith(stop, i) && !(stop === "*" && source.startsWith("**", i))) {
      flush();
      return [nodes, i];
    }
    const char = source[i];
    if (char === "\\" && i + 1 < source.length) {
      text += source[i + 1];
      i += 2;
    } else if (char === "`") {
      const end = source.indexOf("`", i + 1);
      if (end < 0) throw new Error(`Unclosed \` in: ${source}`);
      flush();
      nodes.push({ kind: "code", text: source.slice(i + 1, end) });
      i = end + 1;
    } else if (char === "*") {
      const marker = source.startsWith("**", i) ? "**" : "*";
      const [children, end] = parseUntil(source, i + marker.length, marker);
      if (!source.startsWith(marker, end)) throw new Error(`Unclosed ${marker} in: ${source}`);
      flush();
      nodes.push({ kind: marker === "**" ? "strong" : "em", children });
      i = end + marker.length;
    } else if (char === "[") {
      const [children, end] = parseUntil(source, i + 1, "]");
      const target = /^\]\(([^\s)]+)(?: +([^\s)]+))?\)/.exec(source.slice(end));
      if (!target) throw new Error(`Malformed link in: ${source}`);
      if (target[2] !== undefined && target[2] !== NEW_TAB) throw new Error(`Unknown link option "${target[2]}" in: ${source}`);
      flush();
      nodes.push({ kind: "link", href: target[1], newTab: target[2] === NEW_TAB, children });
      i = end + target[0].length;
    } else {
      text += char;
      i += 1;
    }
  }
  if (stop) throw new Error(`Unclosed ${stop === "]" ? "[" : stop} in: ${source}`);
  flush();
  return [nodes, i];
}
