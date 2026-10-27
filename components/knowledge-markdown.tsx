import type { ReactNode } from "react";

/** Renders the common handbook Markdown subset without interpreting embedded HTML. */
export function KnowledgeMarkdown({ source }: { /** Markdown source text from the private library. */ source: string }) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }

    const fence = line.match(/^\s*```([^`]*)$/);
    if (fence) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push(<pre key={key++}><code className={fence[1] ? `language-${fence[1].trim()}` : undefined}>{code.join("\n")}</code></pre>);
      continue;
    }

    const heading = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const level = Math.min(6, heading[1].length + 1);
      const content = inline(heading[2]);
      blocks.push(level === 2 ? <h2 key={key++}>{content}</h2>
        : level === 3 ? <h3 key={key++}>{content}</h3>
          : level === 4 ? <h4 key={key++}>{content}</h4>
            : level === 5 ? <h5 key={key++}>{content}</h5>
              : <h6 key={key++}>{content}</h6>);
      index += 1;
      continue;
    }

    if (/^\s*(---+|___+|\*\*\*+)\s*$/.test(line)) {
      blocks.push(<hr key={key++} />);
      index += 1;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) quote.push(lines[index++].replace(/^\s*>\s?/, ""));
      blocks.push(<blockquote key={key++}><p>{inline(quote.join(" "))}</p></blockquote>);
      continue;
    }

    const listMatch = line.match(/^\s*(?:([-+*])|(\d+)[.)])\s+(.+)$/);
    if (listMatch) {
      const ordered = Boolean(listMatch[2]);
      const items: ReactNode[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*(?:([-+*])|(\d+)[.)])\s+(.+)$/);
        if (!item || Boolean(item[2]) !== ordered) break;
        items.push(<li key={items.length}>{inline(item[3])}</li>);
        index += 1;
      }
      blocks.push(ordered ? <ol key={key++}>{items}</ol> : <ul key={key++}>{items}</ul>);
      continue;
    }

    if (index + 1 < lines.length && line.includes("|") && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1])) {
      const cells = (row: string) => row.trim().replace(/^\|/u, "").replace(/\|$/u, "").split("|").map((cell) => cell.trim());
      const headers = cells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) rows.push(cells(lines[index++]));
      blocks.push(<div className="knowledge-table-scroll" key={key++} role="region" aria-label="Scrollable table" tabIndex={0}><table><thead><tr>{headers.map((cell, cellIndex) => <th key={cellIndex} scope="col">{inline(cell)}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((_, cellIndex) => <td key={cellIndex}>{inline(row[cellIndex] ?? "")}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(\s*```|\s*#{1,6}\s|\s*>|\s*(?:[-+*]|\d+[.)])\s+|\s*(---+|___+|\*\*\*+)\s*$)/.test(lines[index])) {
      paragraph.push(lines[index++].trim());
    }
    blocks.push(<p key={key++}>{inline(paragraph.join(" "))}</p>);
  }

  return <div className="knowledge-markdown">{blocks}</div>;
}

/** Converts a restrained set of inline Markdown marks into React text nodes. */
function inline(text: string): ReactNode[] {
  const pattern = /(\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/g;
  const result: ReactNode[] = [];
  let previous = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > previous) result.push(text.slice(previous, match.index));
    const key = `inline-${match.index}`;
    if (match[2] && match[3]) {
      let protocol = "";
      try { protocol = new URL(match[3], "https://library.invalid").protocol; } catch { /* Render unsafe or malformed destinations as text. */ }
      result.push(["https:", "http:", "mailto:"].includes(protocol)
        ? <a key={key} href={match[3]} title={match[4]}>{match[2]}</a>
        : match[2]);
    } else if (match[5]) result.push(<code key={key}>{match[5]}</code>);
    else if (match[6] || match[7]) result.push(<strong key={key}>{match[6] || match[7]}</strong>);
    else result.push(<em key={key}>{match[8] || match[9]}</em>);
    previous = pattern.lastIndex;
  }
  if (previous < text.length) result.push(text.slice(previous));
  return result;
}
