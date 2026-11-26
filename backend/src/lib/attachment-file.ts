
export type AllowedAttachmentType = {
  extension: string;
  mimeType: string;
  inlineSafe: boolean;
};

type TypeRule = AllowedAttachmentType & {
  matches: (bytes: Uint8Array) => boolean;
};

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0): boolean =>
  bytes.length >= offset + signature.length &&
  signature.every((value, index) => bytes[offset + index] === value);

const ascii = (text: string): number[] => [...text].map((char) => char.charCodeAt(0));

const includesAscii = (bytes: Uint8Array, text: string): boolean =>
  Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).includes(text, 0, "latin1");

const ZIP_LOCAL_HEADER = [0x50, 0x4b, 0x03, 0x04];
const OLE_HEADER = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

const ooxml = (folder: string) => (bytes: Uint8Array): boolean =>
  startsWith(bytes, ZIP_LOCAL_HEADER) && includesAscii(bytes, folder);

const RULES: Record<string, TypeRule> = {
  jpg: {
    extension: "jpg",
    mimeType: "image/jpeg",
    inlineSafe: true,
    matches: (bytes) => startsWith(bytes, [0xff, 0xd8, 0xff]),
  },
  jpeg: {
    extension: "jpeg",
    mimeType: "image/jpeg",
    inlineSafe: true,
    matches: (bytes) => startsWith(bytes, [0xff, 0xd8, 0xff]),
  },
  png: {
    extension: "png",
    mimeType: "image/png",
    inlineSafe: true,
    matches: (bytes) => startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  gif: {
    extension: "gif",
    mimeType: "image/gif",
    inlineSafe: true,
    matches: (bytes) =>
      startsWith(bytes, ascii("GIF87a")) || startsWith(bytes, ascii("GIF89a")),
  },
  webp: {
    extension: "webp",
    mimeType: "image/webp",
    inlineSafe: true,
    matches: (bytes) =>
      startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8),
  },
  pdf: {
    extension: "pdf",
    mimeType: "application/pdf",
    inlineSafe: true,
    matches: (bytes) => includesAscii(bytes.subarray(0, 1024), "%PDF-"),
  },
  docx: {
    extension: "docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    inlineSafe: false,
    matches: ooxml("word/"),
  },
  pptx: {
    extension: "pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    inlineSafe: false,
    matches: ooxml("ppt/"),
  },
  xlsx: {
    extension: "xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    inlineSafe: false,
    matches: ooxml("xl/"),
  },
  xls: {
    extension: "xls",
    mimeType: "application/vnd.ms-excel",
    inlineSafe: false,
    matches: (bytes) => startsWith(bytes, OLE_HEADER),
  },
};

export const ALLOWED_EXTENSIONS: readonly string[] = Object.keys(RULES);

export type AttachmentDetectionResult =
  | { ok: true; type: AllowedAttachmentType }
  | { ok: false; reason: "EMPTY" | "EXTENSION_NOT_ALLOWED" | "CONTENT_MISMATCH" };

export function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

export function detectAttachmentType(
  fileName: string,
  bytes: Uint8Array,
): AttachmentDetectionResult {
  if (bytes.byteLength === 0) return { ok: false, reason: "EMPTY" };

  const rule = RULES[getExtension(fileName)];
  if (!rule) return { ok: false, reason: "EXTENSION_NOT_ALLOWED" };

  if (!rule.matches(bytes)) return { ok: false, reason: "CONTENT_MISMATCH" };

  const { matches: _matches, ...type } = rule;
  return { ok: true, type };
}

export function isInlineSafeMimeType(mimeType: string): boolean {
  return Object.values(RULES).some((rule) => rule.mimeType === mimeType && rule.inlineSafe);
}

const MAX_FILE_NAME_LENGTH = 200;

export function sanitizeFileName(rawName: string): string {
  let name = rawName;

  if (!/[^\u0000-\u00ff]/.test(name)) {
    const decoded = Buffer.from(name, "latin1").toString("utf8");
    if (!decoded.includes("\uFFFD")) name = decoded;
  }

  name = name
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .split(/[\\/]/)
    .pop()!
    .replace(/^\.+/, "")
    .trim();

  if (name.length > MAX_FILE_NAME_LENGTH) {
    const extension = getExtension(name);
    const suffix = extension ? `.${extension}` : "";
    name = name.slice(0, MAX_FILE_NAME_LENGTH - suffix.length) + suffix;
  }

  return name || "arquivo";
}

export function buildContentDisposition(
  disposition: "inline" | "attachment",
  fileName: string,
): string {
  const asciiFallback = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "_")
    .replace(/["\\%]/g, "_");

  const encoded = encodeURIComponent(fileName).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `${disposition}; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
