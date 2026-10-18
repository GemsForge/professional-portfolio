import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { adminPageRequest } from '../lib/media-server.ts';

const site = 'https://www.gemsforge.com';
const ownerHeaders = {
  'oai-authenticated-user-id': 'owner-site-id',
  'oai-authenticated-user-email': 'diamondbrown79@gmail.com',
};
const ownerRequest = (path, headers = ownerHeaders, method = 'GET') =>
  new Request(`${site}${path}`, { method, headers });

test('direct Admin access remains protected and does not expose identity data', async () => {
  const manager = '<main>private owner workspace</main>';
  const anonymous = adminPageRequest(ownerRequest('/admin/', {}), manager);
  assert.equal(anonymous.status, 302);
  assert.equal(new URL(anonymous.headers.get('location')).searchParams.get('return_to'), '/admin/');
  assert.equal(anonymous.headers.get('cache-control'), 'private, no-store');

  const otherUser = adminPageRequest(adminRequest('/admin/', {
    'oai-authenticated-user-id': 'other-user-id',
    'oai-authenticated-user-email': 'other@example.com',
  }), manager);
  assert.equal(otherUser.status, 403);
  assert.equal(await otherUser.text(), 'This workspace is available only to the portfolio owner.');

  const owner = adminPageRequest(ownerRequest('/admin/'), manager);
  assert.equal(owner.status, 200);
  assert.equal(owner.headers.get('cache-control'), 'private, no-store');
  assert.equal(owner.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal(await owner.text(), manager);
});

test('generated footer always exposes a plain Admin sign-in entry without client-side identity checks', async () => {
  const [home, generatedPages, stylesheet] = await Promise.all([
    readFile(new URL('../static-source/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../lib/static-pages.json', import.meta.url), 'utf8'),
    readFile(new URL('../static-source/assets/site.css', import.meta.url), 'utf8'),
  ]);

  assert.doesNotMatch(home, /href="\/admin\/?"/);
  assert.doesNotMatch(stylesheet, /\.footer\s+nav\s*\{\s*display\s*:\s*none\s*;?\s*\}/);

  for (const page of Object.values(JSON.parse(generatedPages))) {
    if (page.includes('<nav aria-label="Footer navigation">')) {
      const footer = page.match(/<nav aria-label="Footer navigation">([\s\S]*?)<\/nav>/)?.[1];
      assert.ok(footer, 'generated footer navigation exists');
      assert.match(footer, /<a href="\/admin\/">Admin<\/a>/);
      assert.equal((footer.match(/>Admin<\/a>/g) || []).length, 1);
      assert.doesNotMatch(page, /admin-navigation\.js/);
    }
  }
});

function adminRequest(path, headers) {
  return ownerRequest(path, headers);
}
