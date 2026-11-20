import type { RequestHandler } from "express";
import type { ActivityRecordListContext } from "../services/activity-record.scope.js";
import { badRequest, forbidden } from "../lib/errors.js";
import { getAuth } from "../middlewares/authenticate.js";
import {
  createActivityRecordSchema,
  listActivityRecordsQuerySchema,
} from "../models/activity-record.schema.js";
import {
  createActivityRecord,
  listActivityRecords,
} from "../services/activity-record.service.js";

function getCompanyId(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !value) {
    throw badRequest("Empresa não informada.");
  }

  return value;
}

export const createPersonalActivityRecordController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const input = createActivityRecordSchema.parse(req.body);

  const record = await createActivityRecord({ type: "personal", userId: user.id }, input);

  res.status(201).json(record);
};

export const createCompanyActivityRecordController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const companyId = getCompanyId(req.params.companyId);
  const input = createActivityRecordSchema.parse(req.body);

  const record = await createActivityRecord(
    { type: "company", userId: user.id, companyId },
    input,
  );

  res.status(201).json(record);
};

export const listPersonalActivityRecordsController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const query = listActivityRecordsQuerySchema.parse(req.query);

  const result = await listActivityRecords({ type: "personal", userId: user.id }, query);

  res.status(200).json(result);
};

export const listCompanyActivityRecordsController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const companyId = getCompanyId(req.params.companyId);
  const query = listActivityRecordsQuerySchema.parse(req.query);

  const membership = user.memberships.find(
    (item) =>
      item.companyId === companyId &&
      item.status === "ACTIVE",
  );

  if (!membership) {
    throw forbidden();
  }

  const context: ActivityRecordListContext = {
    type: "company",
    userId: user.id,
    companyId,
    role: membership.role,
  };

  const result = await listActivityRecords(context, query);

  res.status(200).json(result);
};
