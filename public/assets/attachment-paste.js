export const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024;

const ACCEPTED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/webm',
]);

function clipboardFiles(clipboardData) {
  const files = Array.from(clipboardData?.files || []);
  if (files.length) return files;

  const fileItems = Array.from(clipboardData?.items || []).filter((item) => item.kind === 'file');
  return fileItems.map((item) => item.getAsFile()).filter(Boolean);
}

export function createAttachmentPasteHandler({ onFile, onReject }) {
  return (event) => {
    const clipboardData = event.clipboardData;
    const files = clipboardFiles(clipboardData);
    const hasFileItem = Array.from(clipboardData?.items || []).some((item) => item.kind === 'file');

    // Leave ordinary text pastes alone; only handle file-bearing paste actions.
    if (!files.length && !hasFileItem) return;
    event.preventDefault();

    if (!files.length) {
      onReject('The pasted attachment could not be read. Choose a file with the file picker and try again.');
      return;
    }
    if (files.length !== 1) {
      onReject('Paste one attachment at a time. Choose a single file and paste it again.');
      return;
    }

    const [file] = files;
    if (!ACCEPTED_TYPES.has(file.type)) {
      onReject('That file type is not supported. Paste a PNG, JPEG, WebP, PDF, MP4, or WebM file.');
      return;
    }
    if (!file.size) {
      onReject('That attachment is empty. Choose a non-empty file and paste it again.');
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      onReject('That file is larger than 50 MB. Choose a smaller attachment.');
      return;
    }

    onFile(file);
  };
}
