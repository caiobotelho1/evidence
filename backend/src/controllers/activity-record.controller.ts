import type { RequestHandler } from "express";
import type { ActivityRecordListContext } from "../services/activity-record.scope.js";
import { badRequest, forbidden, notFound } from "../lib/errors.js";
import { getAuth } from "../middlewares/authenticate.js";
import {
  createActivityRecordSchema,
  listActivityRecordsQuerySchema,
} from "../models/activity-record.schema.js";
import {
  createActivityRecord,
  getActivityRecord,
  listActivityRecords,
} from "../services/activity-record.service.js";

function getCompanyId(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !value) {
    throw badRequest("Empresa não informada.");
  }

  return value;
}

function getRecordId(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !value) {
    throw badRequest("Registro não informado.");
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

  if (query.employeeIds.length > 0) {
    throw badRequest("O filtro por funcionário está disponível apenas no ambiente empresarial.");
  }

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

  if (query.employeeIds.length > 0 && membership.role !== "OWNER") {
    throw forbidden("Somente o proprietário pode filtrar registros por funcionário.");
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

export const getPersonalActivityRecordController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const recordId = getRecordId(req.params.recordId);
  const record = await getActivityRecord(
    { type: "personal", userId: user.id },
    recordId,
  );

  if (!record) {
    throw notFound("Registro não encontrado.");
  }

  res.status(200).json(record);
};

export const getCompanyActivityRecordController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const companyId = getCompanyId(req.params.companyId);
  const recordId = getRecordId(req.params.recordId);
  const membership = user.memberships.find(
    (item) => item.companyId === companyId && item.status === "ACTIVE",
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
  const record = await getActivityRecord(context, recordId);

  if (!record) {
    throw notFound("Registro não encontrado.");
  }

  res.status(200).json(record);
};
