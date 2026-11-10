import { Router } from "express";
import { createMembershipRequestController } from "../controllers/membership.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";

export const membershipRouter = Router({
  mergeParams: true,
});

membershipRouter.post(
  "/",
  requireAuth,
  createMembershipRequestController
);
