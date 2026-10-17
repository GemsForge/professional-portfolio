import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const pages = JSON.parse(await readFile('lib/static-pages.json', 'utf8'));

const cases = [
  {
    route: '/portfolio/projects/hair-log/',
    caption: 'Hair Care Log system responsibilities',
    components: [
      'Care Menu', 'Log Hair Care / Log Hair Retie', 'Hair Care HTTP Request',
      'Search Care Logs', 'Notion API + hair-care database', 'Apple Calendar',
    ],
  },
  {
    route: '/portfolio/projects/75-hard-automation/',
    caption: '75 Hard automation system responsibilities',
    components: [
      'Log Discipline', 'Response helper shortcuts', 'Discipline Http Request',
      'Notion API', 'Discipline database + Goal Tracker relation', 'Finch companion workflow',
    ],
  },
];

for (const { route, caption, components } of cases) {
  test(`${route} explains its workflow responsibilities in an accessible table`, () => {
    const html = pages[route];
    assert.ok(html, `missing generated page ${route}`);
    assert.match(html, /<section id="dependencies">/);
    assert.match(html, /<table class="toolmap">/);
    assert.match(html, /<th scope="col">Tool \/ component<\/th>/);
    assert.ok(html.includes(caption), `missing table caption: ${caption}`);
    for (const component of components) assert.ok(html.includes(component), `missing ${component}`);
    assert.doesNotMatch(html, /<section id="dependencies">[\s\S]*?<ul>/);
  });
}
