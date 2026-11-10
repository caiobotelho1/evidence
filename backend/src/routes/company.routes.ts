import { Router } from "express";
import { createCompanyController } from "../controllers/company.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const companyRouter = Router();

companyRouter.post("/", requireAuth, createCompanyController);