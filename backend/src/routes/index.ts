import { Router } from "express";
import { userRouter } from "./user.routes.js";
import { companyRouter } from "./company.routes.js";

export const apiRouter = Router();

apiRouter.use("/users", userRouter);
apiRouter.use("/companies", companyRouter);