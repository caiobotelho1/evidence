import { createHash } from "node:crypto";
import type { Prisma } from "../generated/prisma/client.js";
import { detectAttachmentType, sanitizeFileName } from "../lib/attachment-file.js";
import type { UploadedFile } from "../lib/attachment-upload.js";
import { env } from "../config/env.js";
import { badRequest, notFound, unsupportedMediaType } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
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

function validateFiles(files: UploadedFile[]) {
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

export async function createAttachments(
  context: ActivityRecordListContext,
  recordId: string,
  files: UploadedFile[],
) {
  await assertRecordAccessible(context, recordId);

  const validFiles = validateFiles(files);

  const existing = await prisma.activityRecordAttachment.count({
    where: { activityRecordId: recordId },
  });

  if (existing + validFiles.length > env.ATTACHMENT_MAX_FILES_PER_RECORD) {
    throw badRequest(
      `Cada registro aceita no máximo ${env.ATTACHMENT_MAX_FILES_PER_RECORD} anexos.`,
      { files: [`O registro já possui ${existing} anexo(s).`] },
    );
  }

  return prisma.$transaction(
    validFiles.map((file) =>
      prisma.activityRecordAttachment.create({
        data: {
          fileName: file.fileName,
          mimeType: file.mimeType,
          sizeBytes: file.buffer.byteLength,
          sha256: createHash("sha256").update(file.buffer).digest("hex"),
          activityRecordId: recordId,
          uploadedById: context.userId,
          content: { create: { data: new Uint8Array(file.buffer) } },
        },
        select: attachmentSelect,
      }),
    ),
  );
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
  const result = await prisma.activityRecordAttachment.deleteMany({
    where: attachmentWhere(context, recordId, attachmentId),
  });

  if (result.count === 0) throw notFound("Anexo não encontrado.");
}
