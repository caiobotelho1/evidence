import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";

export const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/me", requireAuth, meController);
