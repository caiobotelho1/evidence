import { createHash } from "node:crypto";
import type { Prisma } from "../generated/prisma/client.js";
import { detectAttachmentType, sanitizeFileName } from "../lib/attachment-file.js";
import type { UploadedFile } from "../lib/attachment-upload.js";
import { env } from "../config/env.js";
import { badRequest, conflict, notFound, unsupportedMediaType } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { ATTACHABLE_STATUSES, attachmentRejectionMessage } from "../lib/record-status.js";
import {
  buildActivityRecordDetailWhere,
  type ActivityRecordListContext,
} from "./activity-record.scope.js";

const attachmentSelect = {
  id: true,
  fileName: true,
  mimeType: true,
  sizeBytes: true,
  createdAt: true,
  uploadedBy: { select: { id: true, name: true } },
} satisfies Prisma.ActivityRecordAttachmentSelect;

function attachmentWhere(
  context: ActivityRecordListContext,
  recordId: string,
  attachmentId: string,
): Prisma.ActivityRecordAttachmentWhereInput {
  return {
    id: attachmentId,
    activityRecord: buildActivityRecordDetailWhere(context, recordId),
  };
}

async function assertRecordAccessible(
  context: ActivityRecordListContext,
  recordId: string,
): Promise<void> {
  const record = await prisma.activityRecord.findFirst({
    where: buildActivityRecordDetailWhere(context, recordId),
    select: { id: true },
  });

  if (!record) throw notFound("Registro não encontrado.");
}

export function validateAttachmentFiles(files: UploadedFile[]) {
  const problems: string[] = [];
  const valid: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
  }[] = [];

  for (const file of files) {
    const fileName = sanitizeFileName(file.originalName);
    const detection = detectAttachmentType(fileName, file.buffer);

    if (!detection.ok) {
      problems.push(
        detection.reason === "EMPTY"
          ? `${fileName}: o arquivo está vazio.`
          : detection.reason === "EXTENSION_NOT_ALLOWED"
            ? `${fileName}: tipo não permitido. Use imagem (jpg, png, gif, webp), pdf, docx, pptx, xls ou xlsx.`
            : `${fileName}: o conteúdo não corresponde à extensão do arquivo.`,
      );
      continue;
    }

    valid.push({ fileName, mimeType: detection.type.mimeType, buffer: file.buffer });
  }

  if (problems.length > 0) {
    throw unsupportedMediaType("Um ou mais arquivos não são permitidos.", { files: problems });
  }

  return valid;
}

type ValidAttachmentFile = ReturnType<typeof validateAttachmentFiles>[number];

export function assertWithinRecordLimit(existing: number, adding: number): void {
  if (existing + adding > env.ATTACHMENT_MAX_FILES_PER_RECORD) {
    throw badRequest(
      `Cada registro aceita no máximo ${env.ATTACHMENT_MAX_FILES_PER_RECORD} anexos.`,
      { files: [`O registro já possui ${existing} anexo(s).`] },
    );
  }
}

export function toAttachmentCreateData(file: ValidAttachmentFile, uploadedById: string) {
  return {
    fileName: file.fileName,
    mimeType: file.mimeType,
    sizeBytes: file.buffer.byteLength,
    sha256: createHash("sha256").update(file.buffer).digest("hex"),
    uploadedById,
    content: { create: { data: new Uint8Array(file.buffer) } },
  };
}

const UPLOAD_TRANSACTION_OPTIONS = { maxWait: 5_000, timeout: 60_000 };

export async function createAttachments(
  context: ActivityRecordListContext,
  recordId: string,
  files: UploadedFile[],
) {
  const detailWhere = buildActivityRecordDetailWhere(context, recordId);

  const validFiles = validateAttachmentFiles(files);

  return prisma.$transaction(async (transaction) => {
    const completed = await transaction.activityRecord.updateMany({
      where: { AND: [detailWhere, { status: { in: [...ATTACHABLE_STATUSES] } }] },
      data: { status: "COMPLETED", updatedAt: new Date() },
    });

    if (completed.count === 0) {
      const record = await transaction.activityRecord.findFirst({
        where: detailWhere,
        select: { status: true },
      });

      if (!record) throw notFound("Registro não encontrado.");
      throw conflict(attachmentRejectionMessage(record.status));
    }

    const existing = await transaction.activityRecordAttachment.count({
      where: { activityRecordId: recordId },
    });
    assertWithinRecordLimit(existing, validFiles.length);

    const created = [];
    for (const file of validFiles) {
      created.push(
        await transaction.activityRecordAttachment.create({
          data: { ...toAttachmentCreateData(file, context.userId), activityRecordId: recordId },
          select: attachmentSelect,
        }),
      );
    }

    return created;
  }, UPLOAD_TRANSACTION_OPTIONS);
}

export async function listAttachments(context: ActivityRecordListContext, recordId: string) {
  await assertRecordAccessible(context, recordId);

  return prisma.activityRecordAttachment.findMany({
    where: { activityRecordId: recordId },
    select: attachmentSelect,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
}

export async function getAttachmentForDownload(
  context: ActivityRecordListContext,
  recordId: string,
  attachmentId: string,
) {
  const row = await prisma.activityRecordAttachment.findFirst({
    where: attachmentWhere(context, recordId, attachmentId),
    select: {
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      sha256: true,
      content: { select: { data: true } },
    },
  });

  if (!row || !row.content) throw notFound("Anexo não encontrado.");

  return {
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    sha256: row.sha256,
    data: row.content.data,
  };
}

export async function deleteAttachment(
  context: ActivityRecordListContext,
  recordId: string,
  attachmentId: string,
): Promise<void> {
  const attachment = await prisma.activityRecordAttachment.findFirst({
    where: attachmentWhere(context, recordId, attachmentId),
    select: {
      activityRecord: {
        select: { status: true, _count: { select: { attachments: true } } },
      },
    },
  });

  if (!attachment) throw notFound("Anexo não encontrado.");

  const { status, _count } = attachment.activityRecord;
  if (status === "COMPLETED" && _count.attachments <= 1) {
    throw conflict("Um registro concluído precisa manter ao menos um anexo.");
  }

  const result = await prisma.activityRecordAttachment.deleteMany({
    where: attachmentWhere(context, recordId, attachmentId),
  });

  if (result.count === 0) throw notFound("Anexo não encontrado.");
}
