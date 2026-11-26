import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { userRouter } from "./user.routes.js";
import { companyRouter } from "./company.routes.js";
import {personalTagRouter,companyTagRouter} from "./tag.routes.js";
import {
  personalActivityRecordRouter,
  companyActivityRecordRouter,
} from "./activity-record.routes.js";
import {
  personalAttachmentRouter,
  companyAttachmentRouter,
} from "./attachment.routes.js";
import { listMyCompaniesController } from "../controllers/company.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/companies", companyRouter);
apiRouter.use("/tags", personalTagRouter);
apiRouter.use("/companies/:companyId/tags",companyTagRouter);
apiRouter.use("/records", personalActivityRecordRouter);
apiRouter.use("/records/:recordId/attachments", personalAttachmentRouter);
apiRouter.use("/companies/:companyId/records", companyActivityRecordRouter);
apiRouter.use("/companies/:companyId/records/:recordId/attachments", companyAttachmentRouter);
companyRouter.get("/mine",requireAuth,listMyCompaniesController);