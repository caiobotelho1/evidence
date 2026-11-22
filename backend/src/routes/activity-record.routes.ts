import { Router } from "express";
import {
  createCompanyActivityRecordController,
  createPersonalActivityRecordController,
  getCompanyActivityRecordController,
  getPersonalActivityRecordController,
  listCompanyActivityRecordsController,
  listPersonalActivityRecordsController,
  updateCompanyActivityRecordController,
  updatePersonalActivityRecordController,
} from "../controllers/activity-record.controller.js";
import { requireAuth, requirePermission } from "../middlewares/authenticate.js";

export const personalActivityRecordRouter = Router();

personalActivityRecordRouter.use(requireAuth);

personalActivityRecordRouter.post("/", createPersonalActivityRecordController);
personalActivityRecordRouter.get("/", listPersonalActivityRecordsController);
personalActivityRecordRouter.get("/:recordId", getPersonalActivityRecordController);
personalActivityRecordRouter.patch(
  "/:recordId",
  updatePersonalActivityRecordController,
);

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
companyActivityRecordRouter.get(
  "/:recordId",
  requirePermission("record:read", { companyParam: "companyId" }),
  getCompanyActivityRecordController,
);
companyActivityRecordRouter.patch(
  "/:recordId",
  requirePermission("record:write", { companyParam: "companyId" }),
  updateCompanyActivityRecordController,
);
