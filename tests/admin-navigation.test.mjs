import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { adminNavigationRequest, adminPageRequest } from '../lib/media-server.ts';

const site = 'https://www.gemsforge.com';
const ownerHeaders = {
  'oai-authenticated-user-id': 'owner-site-id',
  'oai-authenticated-user-email': 'diamondbrown79@gmail.com',
};
const ownerRequest = (path, headers = ownerHeaders, method = 'GET') =>
  new Request(`${site}${path}`, { method, headers });

test('only the verified owner receives a no-store navigation approval', async () => {
  const ownerResponse = adminNavigationRequest(ownerRequest('/api/admin-navigation'));
  assert.equal(ownerResponse.status, 204);
  assert.equal(ownerResponse.headers.get('cache-control'), 'private, no-store');
  assert.equal(await ownerResponse.text(), '');

  const anonymousResponse = adminNavigationRequest(ownerRequest('/api/admin-navigation', {}));
  assert.equal(anonymousResponse.status, 401);
  const otherUserResponse = adminNavigationRequest(adminRequest('/api/admin-navigation', {
    'oai-authenticated-user-id': 'other-user-id',
    'oai-authenticated-user-email': 'other@example.com',
  }));
  assert.equal(otherUserResponse.status, 403);
  assert.equal(adminNavigationRequest(ownerRequest('/api/admin-navigation', ownerHeaders, 'POST')).status, 405);
});

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

test('public navigation creates no Admin link unless the server approves it', async () => {
  const [script, home, generatedPages] = await Promise.all([
    readFile(new URL('../static-source/assets/admin-navigation.js', import.meta.url), 'utf8'),
    readFile(new URL('../static-source/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../lib/static-pages.json', import.meta.url), 'utf8'),
  ]);

  assert.match(script, /fetch\('\/api\/admin-navigation'.*cache: 'no-store'/);
  assert.match(script, /if \(response\.status !== 204\) return/);
  assert.doesNotMatch(home, /href="\/admin\/?"/);

  const ownerLinks = await renderNavigation(script, 204);
  assert.equal(ownerLinks.length, 1);
  assert.equal(ownerLinks[0].href, '/admin/');
  assert.equal(ownerLinks[0].textContent, 'Admin');
  assert.equal(ownerLinks[0].className, 'nav-contact');
  assert.equal((await renderNavigation(script, 401)).length, 0);
  assert.equal((await renderNavigation(script, 403)).length, 0);

  for (const page of Object.values(JSON.parse(generatedPages))) {
    if (page.includes('<nav class="links" aria-label="Portfolio navigation">')) {
      assert.match(page, /<script src="\/assets\/admin-navigation\.js" defer><\/script>/);
      assert.doesNotMatch(page, /href="\/admin\/?"/);
    }
  }
});

function adminRequest(path, headers) {
  return ownerRequest(path, headers);
}

async function renderNavigation(script, status) {
  const links = [];
  const navigation = { append: (link) => links.push(link) };
  const context = {
    document: {
      querySelector: () => navigation,
      createElement: (tagName) => ({ tagName, className: '', href: '', textContent: '' }),
    },
    fetch: async (path, options) => {
      assert.equal(path, '/api/admin-navigation');
      assert.equal(options.cache, 'no-store');
      assert.equal(options.credentials, 'same-origin');
      return { status };
    },
  };

  runInNewContext(script, context);
  await new Promise((resolve) => setImmediate(resolve));
  return links;
}
