import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { userRouter } from "./user.routes.js";
import { companyRouter } from "./company.routes.js";
import {personalTagRouter,companyTagRouter} from "./tag.routes.js";
import { listMyCompaniesController } from "../controllers/company.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/companies", companyRouter);
apiRouter.use("/tags", personalTagRouter);
apiRouter.use("/companies/:companyId/tags",companyTagRouter);
companyRouter.get("/mine",requireAuth,listMyCompaniesController);