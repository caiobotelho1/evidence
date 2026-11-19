import { Router } from "express";
import {
  createCompanyActivityRecordController,
  createPersonalActivityRecordController,
  listCompanyActivityRecordsController,
  listPersonalActivityRecordsController,
} from "../controllers/activity-record.controller.js";
import { requireAuth, requirePermission } from "../middlewares/authenticate.js";

export const personalActivityRecordRouter = Router();

personalActivityRecordRouter.use(requireAuth);

personalActivityRecordRouter.post("/", createPersonalActivityRecordController);
personalActivityRecordRouter.get("/", listPersonalActivityRecordsController);

export const companyActivityRecordRouter = Router({
  mergeParams: true,
});

companyActivityRecordRouter.use(requireAuth);

companyActivityRecordRouter.post(
  "/",
  requirePermission("record:write", { companyParam: "companyId" }),
  createCompanyActivityRecordController,
);
companyActivityRecordRouter.get(
  "/",
  requirePermission("record:read", { companyParam: "companyId" }),
  listCompanyActivityRecordsController,
);
