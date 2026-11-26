import { Router } from "express";
import {
  companyAttachmentHandlers,
  personalAttachmentHandlers,
} from "../controllers/attachment.controller.js";
import { requireAuth, requirePermission } from "../middlewares/authenticate.js";

export const personalAttachmentRouter = Router({ mergeParams: true });

personalAttachmentRouter.use(requireAuth);
personalAttachmentRouter.post("/", personalAttachmentHandlers.upload);
personalAttachmentRouter.get("/", personalAttachmentHandlers.list);
personalAttachmentRouter.get("/:attachmentId/download", personalAttachmentHandlers.download);
personalAttachmentRouter.delete("/:attachmentId", personalAttachmentHandlers.remove);

export const companyAttachmentRouter = Router({ mergeParams: true });

companyAttachmentRouter.use(requireAuth);
companyAttachmentRouter.post(
  "/",
  requirePermission("record:write", { companyParam: "companyId" }),
  companyAttachmentHandlers.upload,
);
companyAttachmentRouter.get(
  "/",
  requirePermission("record:read", { companyParam: "companyId" }),
  companyAttachmentHandlers.list,
);
companyAttachmentRouter.get(
  "/:attachmentId/download",
  requirePermission("record:read", { companyParam: "companyId" }),
  companyAttachmentHandlers.download,
);
companyAttachmentRouter.delete(
  "/:attachmentId",
  requirePermission("record:write", { companyParam: "companyId" }),
  companyAttachmentHandlers.remove,
);
