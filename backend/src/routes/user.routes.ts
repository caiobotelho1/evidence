import { Router } from "express";
import {createUserController,getUserProfileController,updateUserProfileController,changePasswordController,} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";
export const userRouter = Router();

userRouter.post(
  "/",
  createUserController
);

userRouter.get(
  "/me",
  requireAuth,
  getUserProfileController
);

userRouter.patch(
  "/me",
  requireAuth,
  updateUserProfileController
);

userRouter.patch(
  "/me/password",
  requireAuth,
  changePasswordController
);
