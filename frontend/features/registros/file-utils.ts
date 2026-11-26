export const ATTACHMENT_ACCEPT =
  ".jpg,.jpeg,.png,.gif,.webp,.pdf,.docx,.pptx,.xls,.xlsx";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(size)} ${units[unitIndex]}`;
}

export function mergeFiles(current: File[], incoming: File[]): File[] {
  const merged = [...current];

  for (const file of incoming) {
    const alreadySelected = merged.some(
      (item) =>
        item.name === file.name &&
        item.size === file.size &&
        item.lastModified === file.lastModified,
    );

    if (!alreadySelected) merged.push(file);
  }

  return merged;
}
