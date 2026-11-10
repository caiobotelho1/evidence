import { Router } from "express";
import {
  createCompanyController,
  getCompanyByCnpjController,
} from "../controllers/company.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";
import { membershipRouter } from "./membership.routes.js";

export const companyRouter = Router();

companyRouter.get(
  "/cnpj/:cnpj",
  requireAuth,
  getCompanyByCnpjController
);

companyRouter.post(
  "/",
  requireAuth,
  createCompanyController
);

companyRouter.use(
  "/:companyId/membership-requests",
  membershipRouter
);
