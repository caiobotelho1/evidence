import { Router } from "express";
import { createUserController } from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.post("/", createUserController);
