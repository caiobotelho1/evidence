import type { RequestHandler } from "express";
import { createCompanySchema } from "../models/company.schema.js";
import { createCompany } from "../services/company.service.js";
import { unauthorized } from "../lib/errors.js";

export const createCompanyController: RequestHandler = async (req, res) => {
  const userId = res.locals.userId;

  if (typeof userId !== "string" || !userId) {
    throw unauthorized("Usuário não autenticado.");
  }

  const input = createCompanySchema.parse(req.body);
  const company = await createCompany(input, userId);

  res.status(201).json(company);
};