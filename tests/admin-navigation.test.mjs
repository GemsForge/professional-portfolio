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

test('Manage Project Assets remains protected and does not expose identity data', async () => {
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

test('Manage Project Assets gives both upload steps the same panel and a clear Wiki file note', async () => {
  const [manager, workflow, directory] = await Promise.all([
    readFile(new URL('../lib/image-manager.html', import.meta.url), 'utf8'),
    readFile(new URL('../public/assets/manage-project-assets.js', import.meta.url), 'utf8'),
    readFile(new URL('../components/knowledge-directory.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(manager, /<title>Manage Project Assets/);
  assert.match(manager, /<h1>Manage Project Assets<\/h1>/);
  assert.match(manager, /Project Assets Manager/);
  assert.match(manager, /Wiki Page Uploader/);
  assert.equal((manager.match(/class="workspace-panel"/g) || []).length, 2);
  assert.match(manager, /class="accepted-file-callout"[^>]*role="note"/);
  assert.match(manager, /Accepted files · Up to 20 MB/);
  assert.match(manager, /id="upload-form"/);
  assert.match(manager, /<form id="wiki-upload-form"\s+action="\/api\/knowledge"/);
  assert.match(manager, /<select id="wiki-folder" name="folder" required/);
  assert.match(manager, /<h2 id="wiki-uploader-heading">Wiki Page Uploader<\/h2>/);
  assert.match(manager, /<p id="message" role="status" aria-live="polite"><\/p>/);
  assert.match(manager, /<label for="image">Attachment<\/label>\s*<input type="file" id="image"[^>]*aria-describedby="media-uploader-help paste-help"/);
  assert.match(manager, /<p id="project-assets-description">Upload, edit, publish, or remove portfolio attachments\.<\/p>/);
  assert.match(manager, /<p id="wiki-uploader-description">Uploads are saved to your owner-only Developer Wiki\.<\/p>/);
  assert.match(manager, /aria-describedby="wiki-uploader-description wiki-uploader-help"/);
  const ids = [...manager.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
  assert.equal(new Set(ids).size, ids.length, 'admin workspace IDs must remain unique for label and description references');
  assert.doesNotMatch(manager, /separate tab/);
  const uploaderView = directory.split('if (uploaderOnly) {')[1]?.split('async function deleteReference')[0] ?? '';
  assert.doesNotMatch(uploaderView, /className="eyebrow"|<h1\b|Accepted files:/);
  assert.match(workflow, /\/admin\/knowledge\/uploader/);
  assert.match(workflow, /new URLSearchParams\(window\.location\.search\)\.get\("folder"\)/);
  assert.match(workflow, /uploader\.searchParams\.set\("folder", selectedFolder\)/);
  assert.match(workflow, /event\.origin !== window\.location\.origin/);
});

test('generated footer links to Admin without client-side identity checks', async () => {
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
      assert.match(footer, /<a href="\/knowledge\/">Dev Wiki<\/a>/);
      assert.equal((footer.match(/>Admin<\/a>/g) || []).length, 1);
      assert.doesNotMatch(page, /admin-navigation\.js/);
    }
  }
});

function adminRequest(path, headers) {
  return ownerRequest(path, headers);
}
