
import type { RequestHandler } from "express";
import { createCompanySchema } from "../models/company.schema.js";
import { createCompany } from "../services/company.service.js";
import { getAuth } from "../middlewares/authenticate.js";
import { notFound } from "../lib/errors.js";
import { companyCnpjParamsSchema } from "../models/membership.schema.js";
import { getCompanyByCnpj } from "../services/company.service.js";

export const createCompanyController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const userId = user.id;

  const input = createCompanySchema.parse(req.body);
  const company = await createCompany(input, userId);

  res.status(201).json(company);
};

export const getCompanyByCnpjController: RequestHandler = async (
  req,
  res
) => {
  const { cnpj } = companyCnpjParamsSchema.parse(req.params);

  const company = await getCompanyByCnpj(cnpj);

  if (!company) {
    throw notFound("Empresa não encontrada.");
  }

  res.status(200).json({ company });
};