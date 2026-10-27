/** Private owner-only knowledge file storage, isolated from public portfolio media. */
import { isOwner } from './media-server.ts';

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

async function listRecords(bucket: R2Bucket) {
  const found: KnowledgeRecord[] = [];
  let cursor: string | undefined;
  do {
    const page = await bucket.list({ prefix: RECORD_PREFIX, cursor });
    const records = await Promise.all(page.objects.map(async (object) => {
      const stored = await bucket.get(object.key);
      return stored ? stored.json<KnowledgeRecord>() : null;
    }));
    found.push(...records.filter((record): record is KnowledgeRecord => record !== null));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return found.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
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
