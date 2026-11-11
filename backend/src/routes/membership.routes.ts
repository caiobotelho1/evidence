import { Router } from "express";
import {
  approveMembershipRequestController,
  createMembershipRequestController,
  listPendingMembershipRequestsController,
  rejectMembershipRequestController,
} from "../controllers/membership.controller.js";
import {
  requireAuth,
  requirePermission,
} from "../middlewares/authenticate.js";

export const membershipRouter = Router({
  mergeParams: true,
});

// Solicitação de entrada — HU006
membershipRouter.post(
  "/",
  requireAuth,
  createMembershipRequestController
);

// Listar solicitações pendentes — HU008
membershipRouter.get(
  "/",
  requireAuth,
  requirePermission("membership:review", {
    companyParam: "companyId",
  }),
  listPendingMembershipRequestsController
);

// Aprovar solicitação — HU008
membershipRouter.patch(
  "/:membershipId/approve",
  requireAuth,
  requirePermission("membership:review", {
    companyParam: "companyId",
  }),
  approveMembershipRequestController
);

// Rejeitar solicitação — HU008
membershipRouter.patch(
  "/:membershipId/reject",
  requireAuth,
  requirePermission("membership:review", {
    companyParam: "companyId",
  }),
  rejectMembershipRequestController
);