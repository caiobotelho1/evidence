import { apiFetch, apiFetchBlob, describeApiError } from "./api";
import type { ActivityRecordAttachment } from "./activity-record.service";

type AttachmentScope = {
  recordId: string;
    companyId?: string;
};

function attachmentsPath({ recordId, companyId }: AttachmentScope): string {
  const record = `/records/${encodeURIComponent(recordId)}`;

  return companyId
    ? `/api/companies/${encodeURIComponent(companyId)}${record}/attachments`
    : `/api${record}/attachments`;
}

export async function uploadAttachments(
  scope: AttachmentScope,
  files: File[],
): Promise<ActivityRecordAttachment[]> {
  const body = new FormData();
  files.forEach((file) => body.append("files", file, file.name));

  try {
    const result = await apiFetch<{ items: ActivityRecordAttachment[] }>(
      attachmentsPath(scope),
      { method: "POST", body },
    );

    return result.items;
  } catch (error) {
    throw new Error(describeApiError(error, "Não foi possível anexar os arquivos."));
  }
}

export async function downloadAttachment(
  scope: AttachmentScope,
  attachment: Pick<ActivityRecordAttachment, "id" | "fileName">,
): Promise<void> {
  let blob: Blob;

  try {
    blob = await apiFetchBlob(
      `${attachmentsPath(scope)}/${encodeURIComponent(attachment.id)}/download`,
    );
  } catch (error) {
    throw new Error(describeApiError(error, "Não foi possível baixar o arquivo."));
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = attachment.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
