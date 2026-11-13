/**
 * Shared, framework-free Markdown helpers for the Developer Wiki reader
 * (`components/knowledge-markdown.tsx`) and the downloadable booklet
 * (`lib/knowledge-html.ts`). Kept free of React so `node --test` can cover them.
 */

/** Matches one list item line; groups: indent, bullet marker, ordinal, content. */
export const LIST_ITEM_PATTERN = /^(\s*)(?:([-+*])|(\d+)[.)])\s+(.+)$/;

/** One parsed list item with any directly nested child lists. */
export type ListItemNode = { text: string; children: ListNode[] };
/** One list level; `ordered` is decided by the first item at that level. */
export type ListNode = { ordered: boolean; items: ListItemNode[] };

/** Measures indentation with tabs counted as four spaces. */
const indentWidth = (indent: string) => indent.replace(/\t/g, "    ").length;

/**
 * Parses a run of list lines starting at `start` into a nested list tree.
 * An item indented deeper than its predecessor becomes a child list of that item;
 * a change of ordered/unordered type at the same depth starts a sibling list.
 * Returns the top-level lists plus the index of the first unconsumed line.
 */
export function parseListBlock(lines: string[], start: number): { lists: ListNode[]; next: number } {
  const lists: ListNode[] = [];
  // Stack of open levels, innermost last; each remembers its indentation.
  const stack: { indent: number; list: ListNode }[] = [];
  let index = start;
  while (index < lines.length) {
    const match = lines[index].match(LIST_ITEM_PATTERN);
    if (!match) break;
    const indent = indentWidth(match[1]);
    const ordered = Boolean(match[3]);
    while (stack.length && indent < stack[stack.length - 1].indent) stack.pop();
    const top = stack[stack.length - 1];
    if (top && indent > top.indent) {
      // Deeper than the current level: nest under that level's last item.
      const list: ListNode = { ordered, items: [] };
      top.list.items[top.list.items.length - 1].children.push(list);
      stack.push({ indent, list });
    } else if (!top || top.list.ordered !== ordered) {
      // New top-level list, or a type change at the same depth.
      const list: ListNode = { ordered, items: [] };
      if (stack.length > 1) stack[stack.length - 2].list.items.at(-1)!.children.push(list);
      else lists.push(list);
      if (top) stack.pop();
      stack.push({ indent, list });
    }
    stack[stack.length - 1].list.items.push({ text: match[4], children: [] });
    index += 1;
  }
  return { lists, next: index };
}

/** Link protocols the reader may turn into anchors; everything else is never linked. */
const SAFE_PROTOCOLS = new Set(["https:", "http:", "mailto:"]);

/** Explains why a relative or unsafe link renders as plain text. */
export const UNRESOLVED_LINK_TITLE = "Link not resolved: relative and non-web links are not followed in the Developer Wiki.";

/**
 * Classifies a Markdown link destination.
 * - `external`: absolute http(s)/mailto URL, safe to render as an anchor.
 * - `unresolved`: anything else (relative paths, fragments, `javascript:`,
 *   `data:`, malformed). Rendered as visibly unlinked text with
 *   `UNRESOLVED_LINK_TITLE`, never as an anchor.
 */
export function classifyLink(href: string): "external" | "unresolved" {
  // Absolute only: a scheme must be present, so relative paths are never resolved.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(href.trim())) return "unresolved";
  try { return SAFE_PROTOCOLS.has(new URL(href).protocol) ? "external" : "unresolved"; } catch { return "unresolved"; }
}
