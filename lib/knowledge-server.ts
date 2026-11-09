/** Private owner-only knowledge file storage, isolated from public portfolio media. */
import { isOwner } from './media-server.ts';
import { buildKnowledgeBooklet } from './knowledge-html.ts';

const RECORD_PREFIX = 'owner-knowledge/records/';
const FILE_PREFIX = 'owner-knowledge/files/';
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const TITLE_LIMIT = 160;
const ID_PATTERN = /^[a-f0-9-]{36}$/;
const FOLDERS = new Set([
  'handbooks/architecture',
  'handbooks/backend',
  'handbooks/data',
  'handbooks/codex',
  'handbooks/project-management',
  'handbooks/quality',
  'governance',
  'governance/templates/ci',
  'governance/templates/development',
  'delivery',
  'assets/logos',
]);

type KnowledgeFileType = 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'text/markdown' | 'text/plain' | 'text/html' | 'image/png' | 'image/jpeg' | 'image/webp' | 'image/tiff';
type KnowledgeRecord = {
  id: string;
  title: string;
  folder: string;
  filename: string;
  contentType: KnowledgeFileType;
  size: number;
  createdAt: string;
  description?: string;
  tags?: string[];
  searchText?: string;
};

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}

function denied(request: Request) {
  return json(
    { error: 'Owner sign-in required.' },
    request.headers.get('oai-authenticated-user-id') ? 403 : 401,
  );
}

function sameOrigin(request: Request) {
  return request.headers.get('Origin') === new URL(request.url).origin;
}

function safeFilename(value: string) {
  return value
    .split(/[\\/]/)
    .pop()!
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 180);
}

function fileType(filename: string, bytes: Uint8Array): KnowledgeFileType | null {
  const extension = filename.toLowerCase().split('.').pop();
  if (extension === 'pdf' && bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-') {
    return 'application/pdf';
  }
  if (extension === 'docx' && bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (extension === 'png' && bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return 'image/png';
  if (extension === 'jpg' || extension === 'jpeg') {
    if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  }
  if (extension === 'webp' && bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  if ((extension === 'tif' || extension === 'tiff') && bytes.length >= 4 && (
    (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
    (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a)
  )) return 'image/tiff';
  if (extension === 'md' || extension === 'markdown' || extension === 'txt' || extension === 'html' || extension === 'htm') {
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      if (!text.includes('\0')) {
        if (extension === 'txt') return 'text/plain';
        if (extension === 'html' || extension === 'htm') return 'text/html';
        return 'text/markdown';
      }
    } catch {
      return null;
    }
  }
  return null;
}

/** Derives searchable handbook metadata from Markdown without requiring a second metadata file. */
function inferMarkdownMetadata(source: string, title: string) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const headings = lines.filter((line) => /^\s*#{1,6}\s+/.test(line)).map((line) => line.replace(/^\s*#{1,6}\s+/, '').replace(/\s+#*$/, '').trim());
  const description = lines.map((line) => line.trim()).find((line) => line && !/^#/.test(line) && !/^[-*`>]/.test(line)) ?? `Reference material for ${title}.`;
  const knownTags = ['ASP.NET Core', 'ChatGPT', 'Codex', 'ERD', 'GitHub', 'Migrations', 'OpenAPI', 'PostgreSQL', 'Playwright', 'React', 'SQLite', 'Scrum', 'TanStack Query', 'Testing', 'TypeScript', 'Vapor'];
  const haystack = source.toLocaleLowerCase();
  const tags = knownTags.filter((tag) => haystack.includes(tag.toLocaleLowerCase()));
  const searchText = `${title} ${description} ${headings.join(' ')} ${source.replace(/[`*_>#\[\]()]/g, ' ')}`.replace(/\s+/g, ' ').trim();
  return { description, tags, searchText };
}

async function listRecords(bucket: R2Bucket) {
  const found: KnowledgeRecord[] = [];
  let cursor: string | undefined;
  do {
    const page = await bucket.list({ prefix: RECORD_PREFIX, cursor });
    const records = await Promise.all(page.objects.map(async (object) => {
      const stored = await bucket.get(object.key);
      if (!stored) return null;
      const record = await stored.json<KnowledgeRecord>();
      // Migrate only legacy records with no tag field, then keep listings from rereading their bodies.
      if (record.contentType === 'text/markdown' && record.tags === undefined) {
        const file = await bucket.get(`${FILE_PREFIX}${record.id}`);
        record.tags = file ? inferMarkdownMetadata(await file.text(), record.title).tags : [];
        await bucket.put(object.key, JSON.stringify(record));
      }
      return record;
    }));
    found.push(...records.filter((record): record is KnowledgeRecord => record !== null));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return found.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

/** Builds a UTF-8 USTAR header, splitting long paths into the name and prefix fields when possible. */
function tarHeader(path: string, size: number, modifiedAt: string, type: '0' | 'x' = '0') {
  const encoder = new TextEncoder();
  const bytes = new Uint8Array(512);
  const write = (offset: number, width: number, value: string) => bytes.set(encoder.encode(value).subarray(0, width), offset);
  const octal = (offset: number, width: number, value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    write(offset, width, `${safeValue.toString(8).padStart(width - 1, '0')}\0`);
  };
  const pathBytes = encoder.encode(path);
  let name = path;
  let prefix = '';
  if (pathBytes.length > 100) {
    for (let index = path.lastIndexOf('/'); index > 0; index = path.lastIndexOf('/', index - 1)) {
      const candidatePrefix = path.slice(0, index);
      const candidateName = path.slice(index + 1);
      if (encoder.encode(candidatePrefix).length <= 155 && encoder.encode(candidateName).length <= 100) {
        prefix = candidatePrefix;
        name = candidateName;
        break;
      }
    }
  }
  write(0, 100, name);
  octal(100, 8, 0o644);
  octal(108, 8, 0);
  octal(116, 8, 0);
  octal(124, 12, size);
  octal(136, 12, Math.floor(new Date(modifiedAt).getTime() / 1000));
  bytes.fill(0x20, 148, 156);
  write(156, 1, type);
  write(257, 6, 'ustar\0');
  write(263, 2, '00');
  write(265, 32, '');
  write(297, 32, '');
  write(345, 155, prefix);
  const checksum = bytes.reduce((total, byte) => total + byte, 0);
  write(148, 8, `${checksum.toString(8).padStart(6, '0')}\0 `);
  return bytes;
}

/** Adds one file to a streaming TAR archive without buffering its full contents in memory. */
async function* tarFile(path: string, source: ReadableStream<Uint8Array> | Uint8Array, size: number, modifiedAt: string) {
  const encoder = new TextEncoder();
  let archivePath = path;
  const pathBytes = encoder.encode(path);
  const splitPath = pathBytes.length <= 100 || (() => {
    for (let index = path.lastIndexOf('/'); index > 0; index = path.lastIndexOf('/', index - 1)) {
      if (encoder.encode(path.slice(0, index)).length <= 155 && encoder.encode(path.slice(index + 1)).length <= 100) return true;
    }
    return false;
  })();
  if (!splitPath) {
    const paxLength = (body: string) => {
      let length = encoder.encode(body).length + 2;
      for (;;) {
        const next = encoder.encode(`${length} ${body}`).length;
        if (next === length) return next;
        length = next;
      }
    };
    const body = `path=${path}\n`;
    const record = encoder.encode(`${paxLength(body)} ${body}`);
    yield tarHeader(`PaxHeaders/${crypto.randomUUID()}`, record.length, modifiedAt, 'x');
    yield record;
    if (record.length % 512) yield new Uint8Array(512 - record.length % 512);
    archivePath = `file-${crypto.randomUUID()}`;
  }
  yield tarHeader(archivePath, size, modifiedAt);
  let written = 0;
  if (source instanceof Uint8Array) {
    written = source.length;
    yield source;
  } else {
    const reader = source.getReader();
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        written += value.length;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }
  if (written !== size) throw new Error(`Archive source size mismatch for ${path}.`);
  if (written % 512) yield new Uint8Array(512 - written % 512);
}

/** Streams an owner-only backup with original files and a metadata manifest. */
async function knowledgeBackup(bucket: R2Bucket, resources: KnowledgeRecord[]) {
  const encoder = new TextEncoder();
  const generatedAt = new Date().toISOString();
  const entries = resources.map((record) => ({
    ...record,
    archivePath: `documents/${FOLDERS.has(record.folder) ? record.folder : 'uncategorized'}/${record.id}/${safeFilename(record.filename) || record.id}`,
  }));
  for (let start = 0; start < entries.length; start += 50) {
    const batch = entries.slice(start, start + 50);
    const sourceChecks = await Promise.all(batch.map((record) => bucket.head(`${FILE_PREFIX}${record.id}`)));
    if (sourceChecks.some((source, index) => !source || source.size !== batch[index].size)) {
      return json({ error: 'A stored reference is missing or incomplete, so a complete backup cannot be created.' }, 409);
    }
  }
  const manifest = encoder.encode(JSON.stringify({ generatedAt, files: entries }, null, 2));
  const files = (async function* () {
    yield* tarFile('manifest.json', manifest, manifest.length, generatedAt);
    for (const record of entries) {
      const file = await bucket.get(`${FILE_PREFIX}${record.id}`);
      if (!file) throw new Error(`Missing backup source for ${record.id}.`);
      yield* tarFile(record.archivePath, file.body, record.size, record.createdAt);
    }
    yield new Uint8Array(1024);
  })();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await files.next();
        if (next.done) controller.close();
        else controller.enqueue(next.value);
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      void files.return(undefined);
    },
  });
  const date = generatedAt.slice(0, 10);
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-tar',
      'Content-Disposition': `attachment; filename="developer-wiki-backup-${date}.tar"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

/** Exposes only directory metadata publicly; document bodies and body-derived search data stay private. */
export async function publicKnowledgeRequest(request: Request, env: Cloudflare.Env): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);
  const bucket = env.BUCKET;
  if (!bucket) return json({ error: 'Knowledge storage is unavailable.' }, 503);
  const resources = (await listRecords(bucket)).map(({ id, title, folder, filename, contentType, size, createdAt, tags }) => ({
    id,
    title,
    folder,
    filename,
    contentType,
    size,
    createdAt,
    tags: tags ?? [],
  }));
  return json({ resources });
}

function contentDisposition(filename: string) {
  const ascii = filename.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  const encoded = encodeURIComponent(filename).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

/** Serves private directory metadata and files only after server-side owner checks. */
export async function knowledgeRequest(request: Request, env: Cloudflare.Env): Promise<Response> {
  if (!isOwner(request)) return denied(request);
  const bucket = env.BUCKET;
  if (!bucket) return json({ error: 'Knowledge storage is unavailable.' }, 503);

  const url = new URL(request.url);
  if (request.method === 'GET' && url.pathname === '/api/knowledge/export') {
    return knowledgeBackup(bucket, await listRecords(bucket));
  }
  const id = url.pathname.slice('/api/knowledge'.length).replace(/^\//, '');

  if (request.method === 'GET' && !id) {
    return json({ resources: await listRecords(bucket) });
  }

  if (id && !ID_PATTERN.test(id)) return json({ error: 'Resource not found.' }, 404);

  if (request.method === 'GET' && id) {
    const metadata = await bucket.get(`${RECORD_PREFIX}${id}.json`);
    if (!metadata) return json({ error: 'Resource not found.' }, 404);
    const record = await metadata.json<KnowledgeRecord>();
    // Inline HTML is reserved for the reader's restrictive, sandboxed preview frame.
    const renderHtml = url.searchParams.get('render') === 'html';
    if (renderHtml && record.contentType !== 'text/html') {
      return json({ error: 'Only HTML references can be previewed this way.' }, 415);
    }
    const file = await bucket.get(`${FILE_PREFIX}${id}`);
    if (!file) return json({ error: 'Resource not found.' }, 404);
    if (url.searchParams.get('format') === 'html' && record.contentType === 'text/markdown') {
      const source = await file.text();
      const filename = `${record.filename.replace(/\.(md|markdown)$/i, '')}.html`;
      return new Response(buildKnowledgeBooklet(source, record.title, record.filename, record.tags, {
        logoUrl: `${url.origin}/assets/gemsforge-logo.png`,
        backHref: `${url.origin}/admin/knowledge/read?id=${encodeURIComponent(record.id)}`,
      }), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': contentDisposition(filename),
          'Cache-Control': 'private, no-store',
          'X-Robots-Tag': 'noindex, nofollow',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
    return new Response(file.body, {
      headers: {
        'Content-Type': record.contentType,
        'Content-Disposition': renderHtml ? 'inline' : contentDisposition(record.filename),
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow',
        'X-Content-Type-Options': 'nosniff',
        ...(renderHtml ? {
          'Content-Security-Policy': "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
        } : {}),
      },
    });
  }

  /** Deletes one private reference and its stored file after the owner confirms the request. */
  if (request.method === 'DELETE' && id) {
    if (!sameOrigin(request)) return json({ error: 'Please submit from this website.' }, 403);
    await bucket.delete([`${RECORD_PREFIX}${id}.json`, `${FILE_PREFIX}${id}`]);
    return json({ deleted: true });
  }

  if (request.method === 'POST' && !id) {
    if (!sameOrigin(request)) return json({ error: 'Please submit from this website.' }, 403);
    if (Number(request.headers.get('Content-Length')) > MAX_FILE_BYTES + 65536) {
      return json({ error: 'The maximum file size is 20 MB.' }, 413);
    }
    const form = await request.formData();
    const file = form.get('file');
    const title = String(form.get('title') || '').trim();
    const folder = String(form.get('folder') || '').trim();
    if (!(file instanceof File) || !file.size) return json({ error: 'Choose a file to add.' }, 400);
    if (file.size > MAX_FILE_BYTES) return json({ error: 'The maximum file size is 20 MB.' }, 413);
    if (!title || title.length > TITLE_LIMIT) return json({ error: 'Add a title up to 160 characters.' }, 400);
    if (!FOLDERS.has(folder)) return json({ error: 'Choose a folder in the library.' }, 400);
    const filename = safeFilename(file.name);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType = fileType(filename, bytes);
    if (!contentType) return json({ error: 'Use a valid PDF, DOCX, Markdown, or UTF-8 text file.' }, 415);

    const id = crypto.randomUUID();
    const record: KnowledgeRecord = {
      id,
      title,
      folder,
      filename,
      contentType,
      size: file.size,
      createdAt: new Date().toISOString(),
      ...(contentType === 'text/markdown' ? inferMarkdownMetadata(new TextDecoder().decode(bytes), title) : {}),
    };
    await bucket.put(`${FILE_PREFIX}${id}`, bytes, { httpMetadata: { contentType } });
    try {
      await bucket.put(`${RECORD_PREFIX}${id}.json`, JSON.stringify(record));
    } catch (error) {
      await bucket.delete(`${FILE_PREFIX}${id}`);
      throw error;
    }
    return json({ resource: record }, 201);
  }

  return json({ error: 'Method not allowed.' }, 405);
}
