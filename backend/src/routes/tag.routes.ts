
import { Router } from "express";

import { requireAuth } from "../middlewares/authenticate.js";

import {
  createPersonalTagController,
  createCompanyTagController,
  listPersonalTagsController,
  listCompanyTagsController,
  updatePersonalTagController,
  updateCompanyTagController,
  deletePersonalTagController,
  deleteCompanyTagController,
} from "../controllers/tag.controller.js";

// Rotas de tags pessoais
export const personalTagRouter = Router();

personalTagRouter.use(requireAuth);

personalTagRouter.post("/", createPersonalTagController);
personalTagRouter.get("/", listPersonalTagsController);
personalTagRouter.patch("/:tagId", updatePersonalTagController);
personalTagRouter.delete("/:tagId", deletePersonalTagController);

// Rotas de tags empresariais
export const companyTagRouter = Router({
  mergeParams: true,
});

companyTagRouter.use(requireAuth);

companyTagRouter.post("/", createCompanyTagController);
companyTagRouter.get("/", listCompanyTagsController);
companyTagRouter.patch("/:tagId", updateCompanyTagController);
companyTagRouter.delete("/:tagId", deleteCompanyTagController);
