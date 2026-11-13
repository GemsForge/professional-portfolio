import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyLink, parseListBlock, UNRESOLVED_LINK_TITLE } from '../lib/knowledge-markdown-syntax.ts';
import { buildKnowledgeBooklet } from '../lib/knowledge-html.ts';

const shape = (lists) => lists.map((list) => ({ ordered: list.ordered, items: list.items.map((item) => [item.text, shape(item.children)]) }));

test('indented list items nest under their parent and keep type per level', () => {
  const lines = ['- Parent', '  1. First step', '  2. Second step', '     - Detail', '- Sibling', 'After'];
  const { lists, next } = parseListBlock(lines, 0);
  assert.equal(next, 5);
  assert.deepEqual(shape(lists), [{ ordered: false, items: [
    ['Parent', [{ ordered: true, items: [['First step', []], ['Second step', [{ ordered: false, items: [['Detail', []]] }]]] }]],
    ['Sibling', []],
  ] }]);
});

test('a type change at the same depth starts a sibling list', () => {
  const { lists } = parseListBlock(['- a', '1. b'], 0);
  assert.deepEqual(shape(lists), [{ ordered: false, items: [['a', []]] }, { ordered: true, items: [['b', []]] }]);
});

test('only absolute web and mail links are linkable', () => {
  for (const href of ['https://example.com', 'http://example.com/x', 'mailto:a@example.com']) assert.equal(classifyLink(href), 'external', href);
  for (const href of ['./other.md', '../x.md', 'other.md', '#section', '/knowledge/1', 'javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,x', 'vbscript:x']) assert.equal(classifyLink(href), 'unresolved', href);
});

test('booklet renders nested lists and leaves relative or unsafe links unlinked', () => {
  const html = buildKnowledgeBooklet('- Parent\n  1. Child\n- [Rel](./other.md) [Bad](javascript:alert(1)) [Ok](https://example.com)', 'T', 't.md');
  assert.match(html, /<ul><li>Parent<ol><li>Child<\/li><\/ol><\/li><li>/);
  assert.match(html, new RegExp(`<span class="unresolved-link" title="${UNRESOLVED_LINK_TITLE.replace(/[.]/g, '\\.')}">Rel</span>`));
  assert.doesNotMatch(html, /href="javascript:/i);
  assert.doesNotMatch(html, /href="\.\/other\.md"/);
  assert.match(html, /<a href="https:\/\/example.com" target="_blank" rel="noreferrer">Ok<\/a>/);
});

test('reader component delegates lists and links to the shared syntax helpers', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../components/knowledge-markdown.tsx', import.meta.url), 'utf8');
  assert.match(source, /parseListBlock\(lines, index\)/);
  assert.match(source, /classifyLink\(match\[3\]\) === "external"/);
  assert.match(source, /title=\{UNRESOLVED_LINK_TITLE\}/);
  assert.doesNotMatch(source, /dangerouslySetInnerHTML/);
});
