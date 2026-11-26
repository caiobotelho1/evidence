import type { Request, Response } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import { badRequest, payloadTooLarge } from "./errors.js";

export const MAX_FILE_SIZE_BYTES = Math.floor(env.ATTACHMENT_MAX_FILE_SIZE_MB * 1024 * 1024);

export type UploadedFile = {
  originalName: string;
  buffer: Buffer;
};

const MAX_PAYLOAD_FIELD_BYTES = 256 * 1024;

function buildReceiver(maxFields: number) {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: MAX_FILE_SIZE_BYTES,
      files: env.ATTACHMENT_MAX_FILES_PER_UPLOAD,
      fields: maxFields,
      fieldSize: MAX_PAYLOAD_FIELD_BYTES,
    },
  }).array("files", env.ATTACHMENT_MAX_FILES_PER_UPLOAD);
}

const receiver = buildReceiver(0);
const recordReceiver = buildReceiver(1);

function translateUploadError(error: unknown): unknown {
  if (!(error instanceof multer.MulterError)) return error;

  switch (error.code) {
    case "LIMIT_FILE_SIZE":
      return payloadTooLarge(
        `Cada arquivo deve ter no máximo ${env.ATTACHMENT_MAX_FILE_SIZE_MB} MB.`,
      );
    case "LIMIT_FILE_COUNT":
      return badRequest(
        `Envie no máximo ${env.ATTACHMENT_MAX_FILES_PER_UPLOAD} arquivos por vez.`,
      );
    case "LIMIT_UNEXPECTED_FILE":
      return badRequest('Envie os arquivos no campo "files".');
    case "LIMIT_FIELD_COUNT":
    case "LIMIT_FIELD_VALUE":
      return badRequest('Envie os dados do registro em um único campo "payload".');
    default:
      return badRequest("Não foi possível processar o envio dos arquivos.");
  }
}

export function receiveUploadedFiles(req: Request, res: Response): Promise<UploadedFile[]> {
  return new Promise((resolve, reject) => {
    receiver(req, res, (error?: unknown) => {
      if (error) {
        reject(translateUploadError(error));
        return;
      }

      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      if (files.length === 0) {
        reject(badRequest('Envie ao menos um arquivo no campo "files" (multipart/form-data).'));
        return;
      }

      resolve(files.map((file) => ({ originalName: file.originalname, buffer: file.buffer })));
    });
  });
}

export function receiveRecordWithFiles(
  req: Request,
  res: Response,
): Promise<{ payload: unknown; files: UploadedFile[] }> {
  return new Promise((resolve, reject) => {
    recordReceiver(req, res, (error?: unknown) => {
      if (error) {
        reject(translateUploadError(error));
        return;
      }

      const rawPayload: unknown = req.body?.payload;
      if (typeof rawPayload !== "string") {
        reject(badRequest('Envie os dados do registro no campo "payload" (JSON).'));
        return;
      }

      let payload: unknown;
      try {
        payload = JSON.parse(rawPayload);
      } catch {
        reject(badRequest('O campo "payload" deve conter um JSON válido.'));
        return;
      }

      const files = (req.files as Express.Multer.File[] | undefined) ?? [];

      resolve({
        payload,
        files: files.map((file) => ({ originalName: file.originalname, buffer: file.buffer })),
      });
    });
  });
}
