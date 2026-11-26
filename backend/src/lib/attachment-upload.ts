import type { Request, Response } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import { badRequest, payloadTooLarge } from "./errors.js";

export const MAX_FILE_SIZE_BYTES = Math.floor(env.ATTACHMENT_MAX_FILE_SIZE_MB * 1024 * 1024);

export type UploadedFile = {
  originalName: string;
  buffer: Buffer;
};

const receiver = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: env.ATTACHMENT_MAX_FILES_PER_UPLOAD,
    fields: 0,
  },
}).array("files", env.ATTACHMENT_MAX_FILES_PER_UPLOAD);

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
