
import type { RequestHandler } from "express";
import { createCompanySchema } from "../models/company.schema.js";
import { createCompany } from "../services/company.service.js";
import { getAuth } from "../middlewares/authenticate.js";

export const createCompanyController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const userId = user.id;

  const input = createCompanySchema.parse(req.body);
  const company = await createCompany(input, userId);

  res.status(201).json(company);
};
