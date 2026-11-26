import type { Request, RequestHandler } from "express";
import { buildContentDisposition, isInlineSafeMimeType } from "../lib/attachment-file.js";
import { receiveUploadedFiles } from "../lib/attachment-upload.js";
import { badRequest, forbidden } from "../lib/errors.js";
import { getAuth } from "../middlewares/authenticate.js";
import type { ActivityRecordListContext } from "../services/activity-record.scope.js";
import {
  createAttachments,
  deleteAttachment,
  getAttachmentForDownload,
  listAttachments,
} from "../services/attachment.service.js";

function getParam(value: string | string[] | undefined, message: string): string {
  if (typeof value !== "string" || !value) throw badRequest(message);
  return value;
}

function personalContext(req: Request): ActivityRecordListContext {
  const { user } = getAuth(req);
  return { type: "personal", userId: user.id };
}

function companyContext(req: Request): ActivityRecordListContext {
  const { user } = getAuth(req);
  const companyId = getParam(req.params.companyId, "Empresa não informada.");
  const membership = user.memberships.find(
    (item) => item.companyId === companyId && item.status === "ACTIVE",
  );

  if (!membership) throw forbidden();

  return { type: "company", userId: user.id, companyId, role: membership.role };
}

function recordIdOf(req: Request): string {
  return getParam(req.params.recordId, "Registro não informado.");
}

function attachmentIdOf(req: Request): string {
  return getParam(req.params.attachmentId, "Anexo não informado.");
}

type ContextResolver = (req: Request) => ActivityRecordListContext;

function makeHandlers(resolveContext: ContextResolver) {
  const upload: RequestHandler = async (req, res) => {
    const context = resolveContext(req);
    const recordId = recordIdOf(req);

    const files = await receiveUploadedFiles(req, res);
    const items = await createAttachments(context, recordId, files);

    res.status(201).json({ items });
  };

  const list: RequestHandler = async (req, res) => {
    const items = await listAttachments(resolveContext(req), recordIdOf(req));
    res.status(200).json({ items });
  };

  const download: RequestHandler = async (req, res) => {
    const file = await getAttachmentForDownload(
      resolveContext(req),
      recordIdOf(req),
      attachmentIdOf(req),
    );

    const inline = req.query.disposition === "inline" && isInlineSafeMimeType(file.mimeType);

    res.status(200);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Length", String(file.sizeBytes));
    res.setHeader(
      "Content-Disposition",
      buildContentDisposition(inline ? "inline" : "attachment", file.fileName),
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
    res.setHeader("Cache-Control", "private, no-cache");
    res.setHeader("ETag", `"${file.sha256}"`);
    res.end(Buffer.from(file.data.buffer, file.data.byteOffset, file.data.byteLength));
  };

  const remove: RequestHandler = async (req, res) => {
    await deleteAttachment(resolveContext(req), recordIdOf(req), attachmentIdOf(req));
    res.status(204).end();
  };

  return { upload, list, download, remove };
}

export const personalAttachmentHandlers = makeHandlers(personalContext);
export const companyAttachmentHandlers = makeHandlers(companyContext);
