import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ownerPageGate } from '../lib/media-server.ts';
import { knowledgeRequest, publicKnowledgeRequest } from '../lib/knowledge-server.ts';

class Bucket {
  data = new Map();
  async put(key, value) {
    const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
    this.data.set(key, bytes);
  }
  async get(key) {
    const bytes = this.data.get(key);
    return bytes ? { body: bytes, text: async () => new TextDecoder().decode(bytes), json: async () => JSON.parse(new TextDecoder().decode(bytes)) } : null;
  }
  async list({ prefix }) {
    return { objects: [...this.data.keys()].filter((key) => key.startsWith(prefix)).map((key) => ({ key })), truncated: false };
  }
  async delete(key) {
    for (const entry of Array.isArray(key) ? key : [key]) this.data.delete(entry);
  }
}

const site = 'https://www.gemsforge.com';
const ownerHeaders = {
  'oai-authenticated-user-id': 'owner-site-id',
  'oai-authenticated-user-email': 'diamondbrown79@gmail.com',
  Origin: site,
};

function request(path, method = 'GET', body, headers = ownerHeaders) {
  return new Request(`${site}${path}`, {
    method,
    headers,
    ...(body ? { body } : {}),
  });
}

function pdfUpload(title = 'Reference guide') {
  const form = new FormData();
  form.set('title', title);
  form.set('folder', 'handbooks/backend');
  form.set('file', new File(['%PDF-1.7 sample'], 'guide.pdf', { type: 'application/pdf' }));
  return form;
}

test('anonymous and non-owner requests cannot inspect directory metadata or direct files', async () => {
  const env = { BUCKET: new Bucket() };
  const anonymous = await knowledgeRequest(request('/api/knowledge', 'GET', undefined, {}), env);
  assert.equal(anonymous.status, 401);
  assert.equal(anonymous.headers.get('cache-control'), 'private, no-store');
  assert.equal(anonymous.headers.get('x-robots-tag'), 'noindex, nofollow');

  const otherUser = {
    'oai-authenticated-user-id': 'another-user',
    'oai-authenticated-user-email': 'other@example.com',
  };
  assert.equal((await knowledgeRequest(request('/api/knowledge', 'GET', undefined, otherUser), env)).status, 403);
  assert.equal((await knowledgeRequest(request('/api/knowledge/00000000-0000-4000-8000-000000000000', 'GET', undefined, {}), env)).status, 401);
});

test('owner can upload, list, and download a private reference', async () => {
  const env = { BUCKET: new Bucket() };
  const created = await knowledgeRequest(request('/api/knowledge', 'POST', pdfUpload()), env);
  assert.equal(created.status, 201);
  const { resource } = await created.json();
  assert.equal(resource.title, 'Reference guide');
  assert.equal(resource.folder, 'handbooks/backend');
  assert.equal(resource.filename, 'guide.pdf');
  assert.equal(resource.contentType, 'application/pdf');
  assert.equal('ownerId' in resource, false);

  const listing = await knowledgeRequest(request('/api/knowledge'), env);
  assert.equal(listing.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual((await listing.json()).resources.map(({ title }) => title), ['Reference guide']);

  const download = await knowledgeRequest(request(`/api/knowledge/${resource.id}`), env);
  assert.equal(download.status, 200);
  assert.equal(download.headers.get('content-type'), 'application/pdf');
  assert.match(download.headers.get('content-disposition'), /attachment; filename="guide.pdf"/);
  assert.equal(download.headers.get('cache-control'), 'private, no-store');
  assert.equal(await download.text(), '%PDF-1.7 sample');

  const deleted = await knowledgeRequest(request(`/api/knowledge/${resource.id}`, 'DELETE'), env);
  assert.equal(deleted.status, 200);
  assert.deepEqual([...env.BUCKET.data.keys()], []);
  assert.equal((await knowledgeRequest(request(`/api/knowledge/${resource.id}`), env)).status, 404);
});

test('public directory metadata excludes document bodies and body-derived search fields', async () => {
  const env = { BUCKET: new Bucket() };
  const form = new FormData();
  form.set('title', 'Personal query notes');
  form.set('folder', 'handbooks/backend');
  form.set('file', new File(['# Private heading\n\nprivate-body-sentinel'], 'notes.md', { type: 'text/markdown' }));
  const created = await knowledgeRequest(request('/api/knowledge', 'POST', form), env);
  const { resource } = await created.json();

  const response = await publicKnowledgeRequest(request('/api/public/knowledge', 'GET', undefined, {}), env);
  const data = await response.json();
  const serialized = JSON.stringify(data);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(data.resources[0].id, resource.id);
  assert.equal(data.resources[0].title, 'Personal query notes');
  assert.equal('searchText' in data.resources[0], false);
  assert.equal('description' in data.resources[0], false);
  assert.equal('tags' in data.resources[0], false);
  assert.doesNotMatch(serialized, /private-body-sentinel|Private heading/);
  assert.equal((await knowledgeRequest(request(`/api/knowledge/${resource.id}`, 'GET', undefined, {}), env)).status, 401);
  assert.equal((await publicKnowledgeRequest(request('/api/public/knowledge', 'POST', undefined, {}), env)).status, 405);
});

test('uploads reject cross-origin and unsupported or invalid files', async () => {
  const bucket = new Bucket();
  const env = { BUCKET: bucket };
  const otherOrigin = { ...ownerHeaders, Origin: 'https://elsewhere.example' };
  assert.equal((await knowledgeRequest(request('/api/knowledge', 'POST', pdfUpload(), otherOrigin), env)).status, 403);

  const invalid = new FormData();
  invalid.set('title', 'Not a PDF');
  invalid.set('folder', 'governance');
  invalid.set('file', new File(['not a PDF'], 'fake.pdf', { type: 'application/pdf' }));
  assert.equal((await knowledgeRequest(request('/api/knowledge', 'POST', invalid), env)).status, 415);
  assert.equal(bucket.data.size, 0);
});

test('HTML reference files are stored for download rather than rendered inline', async () => {
  const env = { BUCKET: new Bucket() };
  const form = new FormData();
  form.set('title', 'Library entry page');
  form.set('folder', 'governance');
  form.set('file', new File(['<h1>Private library</h1>'], 'index.html', { type: 'text/html' }));
  const created = await knowledgeRequest(request('/api/knowledge', 'POST', form), env);
  assert.equal(created.status, 201);
  const { resource } = await created.json();
  const download = await knowledgeRequest(request(`/api/knowledge/${resource.id}`), env);
  assert.equal(download.headers.get('content-type'), 'text/html');
  assert.match(download.headers.get('content-disposition'), /attachment/);
  assert.equal(await download.text(), '<h1>Private library</h1>');
});

test('Markdown HTML downloads use the warm booklet generator contract', async () => {
  const env = { BUCKET: new Bucket() };
  const form = new FormData();
  form.set('title', 'Generated handbook');
  form.set('folder', 'handbooks/backend');
  form.set('file', new File(['# Purpose\n\nA practical guide with [reference links](https://example.com/docs).\n\n## Contracts\n\n| Rule | Example |\n| --- | --- |\n| Auth | Session |\n\n```mermaid\nflowchart TD\n  A[Request] --> B[Response]\n```'], 'guide.md', { type: 'text/markdown' }));
  const created = await knowledgeRequest(request('/api/knowledge', 'POST', form), env);
  const { resource } = await created.json();
  const generated = await knowledgeRequest(request(`/api/knowledge/${resource.id}?format=html`), env);
  const html = await generated.text();
  assert.equal(generated.status, 200);
  assert.match(html, /class="book"/);
  assert.match(html, /id="navigator"/);
  assert.match(html, /href="#section-1"/);
  assert.match(html, /mermaid\.initialize/);
  assert.match(html, /flowchart TD/);
  assert.match(html, /class="table-scroll"/);
  assert.match(html, /<th scope="col">Rule<\/th>/);
  assert.match(html, /<td>Session<\/td>/);
  assert.match(html, /<a href="https:\/\/example.com\/docs" target="_blank" rel="noreferrer">reference links<\/a>/);
  assert.match(html, /Avenir Next/);
});

test('knowledge page gate redirects anonymous users and denies non-owners', async () => {
  const anonymous = ownerPageGate(request('/admin/knowledge', 'GET', undefined, {}), '/admin/knowledge');
  assert.equal(anonymous.status, 302);
  assert.equal(new URL(anonymous.headers.get('location')).searchParams.get('return_to'), '/admin/knowledge');

  const otherUser = {
    'oai-authenticated-user-id': 'another-user',
    'oai-authenticated-user-email': 'other@example.com',
  };
  assert.equal(ownerPageGate(request('/admin/knowledge', 'GET', undefined, otherUser), '/admin/knowledge').status, 403);
  assert.equal(ownerPageGate(request('/admin/knowledge'), '/admin/knowledge'), null);
  const wikiReaderGate = ownerPageGate(request('/knowledge/private-wiki', 'GET', undefined, {}), '/knowledge/private-wiki');
  assert.equal(wikiReaderGate.status, 302);
  assert.equal(new URL(wikiReaderGate.headers.get('location')).searchParams.get('return_to'), '/knowledge/private-wiki');

  const [pages, home, worker, route, component, reader] = await Promise.all([
    readFile(new URL('../lib/static-pages.json', import.meta.url), 'utf8'),
    readFile(new URL('../static-source/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../build/sites-worker.ts', import.meta.url), 'utf8'),
    readFile(new URL('../app/admin/knowledge/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/knowledge-directory.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/knowledge-reader.tsx', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(pages, /Knowledge directory|owner-knowledge/);
  assert.doesNotMatch(home, /href="\/admin\/knowledge\/?"/);
  assert.match(worker, /ownerPageGate\(request, '\/admin\/knowledge'\)/);
  assert.match(worker, /url\.pathname\.startsWith\('\/knowledge\/'\)/);
  assert.match(worker, /handler\.fetch\(request, env, ctx\)/);
  assert.match(route, /robots: \{ index: false, follow: false \}/);
  assert.match(component, /export function KnowledgeDirectory/);
  assert.match(component, /fetch\("\/api\/knowledge"/);
  assert.match(component, /File name/);
  assert.match(component, /Download/);
  assert.match(reader, /Render Markdown/);
  assert.match(reader, /Markdown source/);
  assert.match(reader, /Download Markdown/);
  assert.match(worker, /knowledgeRequest\(request,env\)/);
});

test('public and owner directories share the existing reader while keeping owner tools gated', async () => {
  const [worker, publicPage, publicReader, ownerHandbooks, directory, reader, footer, generator, adminPage] = await Promise.all([
    readFile(new URL('../build/sites-worker.ts', import.meta.url), 'utf8'),
    readFile(new URL('../app/knowledge/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/knowledge/[id]/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/admin/handbooks/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/knowledge-directory.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/knowledge-reader.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/site-footer.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../scripts/prepare-pages.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../lib/image-manager.html', import.meta.url), 'utf8'),
  ]);
  assert.match(publicPage, /<KnowledgeDirectory publicMode \/>/);
  assert.match(publicReader, /<KnowledgeReader id=\{id\} publicMode \/>/);
  assert.match(ownerHandbooks, /initialModule="handbooks"/);
  assert.match(worker, /ownerPageGate\(request, `\$\{url\.pathname\}\$\{url\.search\}`\)/);
  assert.match(worker, /ownerPageGate\(request, '\/admin\/handbooks'\)/);
  assert.match(directory, /fetch\(publicMode \? "\/api\/public\/knowledge" : "\/api\/knowledge"/);
  assert.match(directory, /initialModule && !publicMode/);
  assert.match(directory, /MY DEVELOPER NOTES/);
  assert.match(directory, /Developer Wiki/);
  assert.match(directory, /<time dateTime=\{resource\.createdAt\}>/);
  assert.match(reader, /publicMode \? "\/knowledge\/" : "\/admin\/knowledge\/"/);
  assert.match(footer, /href="\/knowledge\/">Dev Wiki/);
  assert.match(generator, /href="\/knowledge\/">Dev Wiki/);
  assert.match(adminPage, /Developer Wiki/);
});
